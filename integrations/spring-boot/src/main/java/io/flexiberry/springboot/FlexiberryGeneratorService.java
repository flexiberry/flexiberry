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
            return generateRootBerryDsl(linkPaths);
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
            writer.comment("------------------------------------------------------------------");
            writer.comment("INFERRED SEQUENTIAL MULTI-API TASKS");
            writer.comment("------------------------------------------------------------------");
            writer.blankLine();
            workflowInferrer.inferWorkflows(endpoints, writer);
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
     * Generate the root .berry DSL that imports each controller file via 'Link'.
     */
    public String generateRootBerryDsl(List<String> linkPaths) {
        BerryWriter writer = new BerryWriter(4);

        writer.comment("------------------------------------------------------------------");
        writer.comment("FLEXIBERRY ROOT WORKFLOW SPECIFICATION");
        writer.comment("Auto-generated from Spring Boot application controllers");
        writer.comment("Generated at: " + Instant.now());
        writer.comment("Total Linked Controllers: " + linkPaths.size());
        writer.comment("------------------------------------------------------------------");
        writer.blankLine();

        for (String path : linkPaths) {
            writer.link(path);
        }

        return writer.build();
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

        // Write root file with Link statements
        String rootDsl = generateRootBerryDsl(linkPaths);
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
