package io.flexiberry.springboot.autoconfigure;

import io.flexiberry.springboot.FlexiberryGeneratorService;
import io.flexiberry.springboot.FlexiberryProperties;
import io.flexiberry.springboot.endpoint.FlexiberryExportController;
import io.flexiberry.springboot.runner.FlexiberryStartupRunner;
import io.flexiberry.springboot.scanner.SpringRouteScanner;
import org.springframework.boot.autoconfigure.AutoConfiguration;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.autoconfigure.condition.ConditionalOnWebApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

@AutoConfiguration
@ConditionalOnWebApplication
@EnableConfigurationProperties(FlexiberryProperties.class)
@ConditionalOnProperty(name = "flexiberry.enabled", havingValue = "true", matchIfMissing = true)
public class FlexiberryAutoConfiguration {

    @Bean
    @ConditionalOnMissingBean
    public SpringRouteScanner springRouteScanner(RequestMappingHandlerMapping handlerMapping,
                                                 FlexiberryProperties properties) {
        return new SpringRouteScanner(handlerMapping, properties);
    }

    @Bean
    @ConditionalOnMissingBean
    public FlexiberryGeneratorService flexiberryGeneratorService(SpringRouteScanner scanner,
                                                                 FlexiberryProperties properties) {
        return new FlexiberryGeneratorService(scanner, properties);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(name = "flexiberry.export-endpoint-enabled", havingValue = "true", matchIfMissing = true)
    public FlexiberryExportController flexiberryExportController(FlexiberryGeneratorService generatorService) {
        return new FlexiberryExportController(generatorService);
    }

    @Bean
    @ConditionalOnMissingBean
    @ConditionalOnProperty(name = "flexiberry.generate-on-startup", havingValue = "true")
    public FlexiberryStartupRunner flexiberryStartupRunner(FlexiberryGeneratorService generatorService,
                                                           FlexiberryProperties properties) {
        return new FlexiberryStartupRunner(generatorService, properties);
    }
}
