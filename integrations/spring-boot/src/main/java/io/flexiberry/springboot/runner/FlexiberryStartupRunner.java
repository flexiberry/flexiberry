package io.flexiberry.springboot.runner;

import io.flexiberry.springboot.FlexiberryGeneratorService;
import io.flexiberry.springboot.FlexiberryProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;

import java.nio.file.Path;

/**
 * Automatically triggers .berry specification generation on application startup
 * if 'flexiberry.generate-on-startup=true' is configured.
 */
public class FlexiberryStartupRunner implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(FlexiberryStartupRunner.class);

    private final FlexiberryGeneratorService generatorService;
    private final FlexiberryProperties properties;

    public FlexiberryStartupRunner(FlexiberryGeneratorService generatorService, FlexiberryProperties properties) {
        this.generatorService = generatorService;
        this.properties = properties;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (properties.isGenerateOnStartup()) {
            try {
                Path target = generatorService.writeDefaultBerryFile();
                log.info("🍓 Successfully generated Flexiberry specification at: {}", target.toAbsolutePath());
            } catch (Exception e) {
                log.error("Failed to generate Flexiberry specification on startup", e);
            }
        }
    }
}
