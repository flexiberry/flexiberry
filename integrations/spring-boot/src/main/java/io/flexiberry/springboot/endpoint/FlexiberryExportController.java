package io.flexiberry.springboot.endpoint;

import io.flexiberry.springboot.FlexiberryGeneratorService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Development and CI endpoint exposing live .berry DSL generation from running application.
 */
@RestController
public class FlexiberryExportController {

    private final FlexiberryGeneratorService generatorService;

    public FlexiberryExportController(FlexiberryGeneratorService generatorService) {
        this.generatorService = generatorService;
    }

    @GetMapping(value = "/flexiberry/export.berry", produces = MediaType.TEXT_PLAIN_VALUE)
    public ResponseEntity<String> exportBerrySpec() {
        String berryDsl = generatorService.generateBerryDsl();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"application.berry\"")
            .body(berryDsl);
    }
}
