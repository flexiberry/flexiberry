package io.flexiberry.springboot;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

@ConfigurationProperties(prefix = "flexiberry")
public class FlexiberryProperties {

    /** Enable or disable Flexiberry spec generator */
    private boolean enabled = true;

    /** Base URL prefixed to endpoints (e.g. http://localhost:8080) */
    private String baseUrl = "http://localhost:8080";

    /** Target directory to write generated .berry files */
    private String outputDir = "src/test/resources/flexiberry";

    /** Default file name for the emitted .berry spec */
    private String fileName = "application.berry";

    /** Automatically write .berry spec on application startup */
    private boolean generateOnStartup = false;

    /** Automatically infer sequential CRUD lifecycle tasks (Task ... Step Call Api ...) */
    private boolean inferWorkflows = true;

    /** Expose the HTTP endpoint /flexiberry/export.berry */
    private boolean exportEndpointEnabled = true;

    /** Restrict scanning to controllers in specified package prefixes */
    private List<String> basePackages = new ArrayList<>();

    /**
     * If true, generates a separate .berry file for each controller and links/imports
     * them into the main entry file using the 'Link' keyword.
     */
    private boolean splitByController = false;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getOutputDir() { return outputDir; }
    public void setOutputDir(String outputDir) { this.outputDir = outputDir; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public boolean isGenerateOnStartup() { return generateOnStartup; }
    public void setGenerateOnStartup(boolean generateOnStartup) { this.generateOnStartup = generateOnStartup; }

    public boolean isInferWorkflows() { return inferWorkflows; }
    public void setInferWorkflows(boolean inferWorkflows) { this.inferWorkflows = inferWorkflows; }

    public boolean isExportEndpointEnabled() { return exportEndpointEnabled; }
    public void setExportEndpointEnabled(boolean exportEndpointEnabled) { this.exportEndpointEnabled = exportEndpointEnabled; }

    public List<String> getBasePackages() { return basePackages; }
    public void setBasePackages(List<String> basePackages) { this.basePackages = basePackages; }

    public boolean isSplitByController() { return splitByController; }
    public void setSplitByController(boolean splitByController) { this.splitByController = splitByController; }
}
