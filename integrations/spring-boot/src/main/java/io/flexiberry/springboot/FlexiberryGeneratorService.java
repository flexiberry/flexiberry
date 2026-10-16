package io.flexiberry.springboot;

import io.flexiberry.springboot.scanner.DiscoveredEndpoint;
import io.flexiberry.springboot.scanner.SpringRouteScanner;
import io.flexiberry.springboot.scanner.WorkflowSequenceInferrer;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.*;

/**
 * Service that orchestrates the scanning of Spring Boot controllers
 * and generates type-safe .berry DSL workflow specifications.
 */
public class FlexiberryGeneratorService {

    private final SpringRouteScanner scanner;
    private final FlexiberryProperties properties;
    private final WorkflowSequenceInferrer workflowInferrer;

    public FlexiberryGeneratorService(SpringRouteScanner scanner, FlexiberryProperties properties) {
        this.scanner = scanner;
        this.properties = properties;
        this.workflowInferrer = new WorkflowSequenceInferrer();
    }

    /**
     * Group discovered endpoints by their declaring controller name.
     */
    public Map<String, List<DiscoveredEndpoint>> getEndpointsByController() {
        List<DiscoveredEndpoint> endpoints = scanner.scanEndpoints();
        Map<String, List<DiscoveredEndpoint>> grouped = new LinkedHashMap<>();
        for (DiscoveredEndpoint ep : endpoints) {
            grouped.computeIfAbsent(ep.controllerName(), k -> new ArrayList<>()).add(ep);
        }
        return grouped;
    }

    /**
     * Generate the complete .berry DSL text.
     * If 'flexiberry.split-by-controller' is true, emits the root file with 'Link' statements.
     */
    public String generateBerryDsl() {
        if (properties.isSplitByController()) {
            Map<String, List<DiscoveredEndpoint>> grouped = getEndpointsByController();
            List<String> linkPaths = new ArrayList<>();
            for (String controllerName : grouped.keySet()) {
                linkPaths.add("./controllers/" + toKebabCase(controllerName) + ".berry");
            }
            return generateRootBerryDsl(linkPaths, grouped);
        }

        List<DiscoveredEndpoint> endpoints = scanner.scanEndpoints();
        BerryWriter writer = new BerryWriter(4);

        // Header comments
        writer.comment("------------------------------------------------------------------");
        writer.comment("FLEXIBERRY WORKFLOW SPECIFICATION");
        writer.comment("Auto-generated from Spring Boot application controllers");
        writer.comment("Generated at: " + Instant.now());
        writer.comment("Total Discovered Endpoints: " + endpoints.size());
        writer.comment("------------------------------------------------------------------");
        writer.blankLine();

        if (properties.isUseBaseUrlVariable()) {
            writeBaseUrlVariable(writer);
        }

        // Write each discovered API block
        for (DiscoveredEndpoint ep : endpoints) {
            writer.api(
                ep.method(),
                ep.apiId(),
                ep.title(),
                ep.path(),
                ep.headers(),
                ep.requestBodyJson()
            );
        }

        // Infer sequential multi-API workflow tasks
        if (properties.isInferWorkflows()) {
            BerryWriter taskWriter = new BerryWriter(4);
            if (workflowInferrer.inferWorkflows(endpoints, taskWriter)) {
                writer.comment("------------------------------------------------------------------");
                writer.comment("INFERRED SEQUENTIAL MULTI-API TASKS");
                writer.comment("------------------------------------------------------------------");
                writer.blankLine();
                writer.appendRaw(taskWriter.build());
            }
        }

        return writer.build();
    }

    /**
     * Generate .berry DSL for a single controller.
     */
    public String generateControllerBerryDsl(String controllerName, List<DiscoveredEndpoint> endpoints) {
        BerryWriter writer = new BerryWriter(4);

        writer.comment("------------------------------------------------------------------");
        writer.comment("CONTROLLER: " + controllerName);
        writer.comment("Auto-generated from Spring Boot controller");
        writer.comment("Total Endpoints: " + endpoints.size());
        writer.comment("------------------------------------------------------------------");
        writer.blankLine();

        if (properties.isUseBaseUrlVariable()) {
            writeBaseUrlVariable(writer);
        }

        for (DiscoveredEndpoint ep : endpoints) {
            writer.api(
                ep.method(),
                ep.apiId(),
                ep.title(),
                ep.path(),
                ep.headers(),
                ep.requestBodyJson()
            );
        }

        if (properties.isInferWorkflows()) {
            workflowInferrer.inferControllerLifecycle(controllerName, endpoints, writer);
        }

        return writer.build();
    }

    /**
     * Generate the root .berry DSL that imports each controller file via 'Link'
     * and optionally includes lifecycle Tasks for each controller.
     */
    public String generateRootBerryDsl(List<String> linkPaths) {
        return generateRootBerryDsl(linkPaths, getEndpointsByController());
    }

    public String generateRootBerryDsl(List<String> linkPaths, Map<String, List<DiscoveredEndpoint>> groupedEndpoints) {
        BerryWriter writer = new BerryWriter(4);

        writer.comment("------------------------------------------------------------------");
        writer.comment("FLEXIBERRY ROOT WORKFLOW SPECIFICATION");
        writer.comment("Auto-generated from Spring Boot application controllers");
        writer.comment("Generated at: " + Instant.now());
        writer.comment("Total Linked Controllers: " + linkPaths.size());
        writer.comment("------------------------------------------------------------------");
        writer.blankLine();

        if (properties.isUseBaseUrlVariable()) {
            writeBaseUrlVariable(writer);
        }

        for (String path : linkPaths) {
            writer.link(path);
        }

        if (properties.isInferWorkflows() && groupedEndpoints != null && !groupedEndpoints.isEmpty()) {
            BerryWriter taskWriter = new BerryWriter(4);
            boolean anyTask = false;
            for (Map.Entry<String, List<DiscoveredEndpoint>> entry : groupedEndpoints.entrySet()) {
                if (workflowInferrer.inferControllerLifecycle(entry.getKey(), entry.getValue(), taskWriter)) {
                    anyTask = true;
                }
            }

            if (anyTask) {
                writer.blankLine();
                writer.comment("------------------------------------------------------------------");
                writer.comment("INFERRED SEQUENTIAL MULTI-API TASKS");
                writer.comment("------------------------------------------------------------------");
                writer.blankLine();
                writer.appendRaw(taskWriter.build());
            }
        }

        return writer.build();
    }

    private void writeBaseUrlVariable(BerryWriter writer) {
        String varName = properties.getBaseUrlVariableName();
        if (varName == null || varName.isBlank()) {
            varName = "baseUrl";
        }
        String baseValue = properties.getBaseUrl();
        if (baseValue == null || baseValue.isBlank()) {
            baseValue = "http://localhost:8080";
        } else {
            baseValue = baseValue.replaceAll("/+$", "");
        }

        if (baseValue.startsWith("{{") && baseValue.endsWith("}}")) {
            baseValue = baseValue.substring(2, baseValue.length() - 2).trim();
        }

        Map<String, Object> entries = new LinkedHashMap<>();
        entries.put(varName.trim(), baseValue);
        writer.var("AppConfig", null, entries);
    }

    /**
     * Write generated .berry file(s) to target directory.
     * If 'flexiberry.split-by-controller' is true, creates a separate file for each
     * controller under a 'controllers/' subfolder and links them from the main file.
     */
    public List<Path> writeBerryFiles(Path mainPath) throws IOException {
        List<Path> writtenFiles = new ArrayList<>();

        if (mainPath.getParent() != null) {
            Files.createDirectories(mainPath.getParent());
        }

        if (!properties.isSplitByController()) {
            String dsl = generateBerryDsl();
            Files.writeString(mainPath, dsl, StandardCharsets.UTF_8);
            writtenFiles.add(mainPath);
            return writtenFiles;
        }

        // Split by controller
        Map<String, List<DiscoveredEndpoint>> grouped = getEndpointsByController();
        Path baseDir = mainPath.getParent() != null ? mainPath.getParent() : Path.of(".");
        Path controllersDir = baseDir.resolve("controllers");
        Files.createDirectories(controllersDir);

        List<String> linkPaths = new ArrayList<>();

        for (Map.Entry<String, List<DiscoveredEndpoint>> entry : grouped.entrySet()) {
            String controllerName = entry.getKey();
            List<DiscoveredEndpoint> controllerEndpoints = entry.getValue();

            String fileName = toKebabCase(controllerName) + ".berry";
            Path controllerFilePath = controllersDir.resolve(fileName);
            String controllerDsl = generateControllerBerryDsl(controllerName, controllerEndpoints);

            Files.writeString(controllerFilePath, controllerDsl, StandardCharsets.UTF_8);
            writtenFiles.add(controllerFilePath);

            linkPaths.add("./controllers/" + fileName);
        }

        // Write root file with Link statements and tasks
        String rootDsl = generateRootBerryDsl(linkPaths, grouped);
        Files.writeString(mainPath, rootDsl, StandardCharsets.UTF_8);
        writtenFiles.add(0, mainPath);

        return writtenFiles;
    }

    public Path writeBerryFile(Path targetPath) throws IOException {
        List<Path> paths = writeBerryFiles(targetPath);
        return paths.get(0);
    }

    public Path writeDefaultBerryFile() throws IOException {
        Path path = Path.of(properties.getOutputDir(), properties.getFileName());
        return writeBerryFile(path);
    }

    private String toKebabCase(String name) {
        return name.replaceAll("([a-z])([A-Z])", "$1-$2")
                   .replaceAll("([A-Z]+)([A-Z][a-z])", "$1-$2")
                   .toLowerCase();
    }
}
