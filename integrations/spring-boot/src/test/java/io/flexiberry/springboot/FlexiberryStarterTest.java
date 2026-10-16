package io.flexiberry.springboot;

import io.flexiberry.springboot.sample.TestApplication;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(classes = TestApplication.class)
class FlexiberryStarterTest {

    @Autowired
    private FlexiberryGeneratorService generatorService;

    @Autowired
    private FlexiberryProperties properties;

    @Test
    void testSingleFileGeneration() throws IOException {
        properties.setSplitByController(false);
        properties.setUseBaseUrlVariable(true);
        properties.setBaseUrl("http://localhost:8080");
        properties.setBaseUrlVariableName("baseUrl");

        String berryDsl = generatorService.generateBerryDsl();
        assertNotNull(berryDsl);
        assertFalse(berryDsl.isBlank());

        System.out.println("====== SINGLE FILE .BERRY DSL ======");
        System.out.println(berryDsl);
        System.out.println("====================================");

        // Verify base URL variable in .berry file
        assertTrue(berryDsl.contains("Var AppConfig"), "Should declare Var AppConfig block");
        assertTrue(berryDsl.contains("- baseUrl: 'http://localhost:8080'"), "Should declare baseUrl variable entry");

        // Verify API blocks append baseUrl variable with endpoints
        assertTrue(berryDsl.contains("Api POST #create"), "Should contain UserController.create");
        assertTrue(berryDsl.contains("Api POST #createOrder"), "Should contain OrderController.createOrder");
        assertTrue(berryDsl.contains("Url {{baseUrl}}/api/v1/users/{{id}}"), "Should append {{baseUrl}} with user path variable");
        assertTrue(berryDsl.contains("Url {{baseUrl}}/api/v1/orders/{{orderId}}"), "Should append {{baseUrl}} with order path variable");

        // Verify inferred sequential CRUD Tasks for both
        assertTrue(berryDsl.contains("Task User Lifecycle Workflow"));
        assertTrue(berryDsl.contains("Task Order Lifecycle Workflow"));

        // Verify writing to disk
        Path outputPath = Path.of("target/flexiberry/single-app.berry");
        generatorService.writeBerryFile(outputPath);
        assertTrue(Files.exists(outputPath));
        assertTrue(Files.size(outputPath) > 0);
    }

    @Test
    void testSplitByControllerGeneration() throws IOException {
        properties.setSplitByController(true);
        properties.setUseBaseUrlVariable(true);
        properties.setBaseUrl("http://localhost:8080");
        properties.setBaseUrlVariableName("baseUrl");

        Path mainPath = Path.of("target/flexiberry/modular/application.berry");
        List<Path> writtenFiles = generatorService.writeBerryFiles(mainPath);

        System.out.println("====== SPLIT BY CONTROLLER FILES ======");
        for (Path p : writtenFiles) {
            System.out.println("Generated file: " + p.toAbsolutePath());
        }

        // 1. Verify files written
        assertEquals(3, writtenFiles.size(), "Should write root file + 2 controller files");
        assertTrue(Files.exists(mainPath), "Root file must exist");

        Path userControllerFile = mainPath.getParent().resolve("controllers/user-controller.berry");
        Path orderControllerFile = mainPath.getParent().resolve("controllers/order-controller.berry");
        assertTrue(Files.exists(userControllerFile), "user-controller.berry must exist");
        assertTrue(Files.exists(orderControllerFile), "order-controller.berry must exist");

        // 2. Verify Root file contains Link statements, baseUrl Var, and Tasks for each controller
        String rootContent = Files.readString(mainPath);
        System.out.println("------ ROOT FILE CONTENT ------\n" + rootContent);
        assertTrue(rootContent.contains("Var AppConfig"), "Root should contain Var AppConfig");
        assertTrue(rootContent.contains("- baseUrl: 'http://localhost:8080'"), "Root should declare baseUrl variable");
        assertTrue(rootContent.contains("Link ./controllers/user-controller.berry"), "Root must link user-controller");
        assertTrue(rootContent.contains("Link ./controllers/order-controller.berry"), "Root must link order-controller");
        assertTrue(rootContent.contains("Task User Lifecycle Workflow"), "Root must contain User Lifecycle Task");
        assertTrue(rootContent.contains("Task Order Lifecycle Workflow"), "Root must contain Order Lifecycle Task");
        assertFalse(rootContent.contains("Api POST #createOrder"), "Root should not duplicate API blocks");

        // 3. Verify user controller file content
        String userContent = Files.readString(userControllerFile);
        System.out.println("------ USER CONTROLLER FILE CONTENT ------\n" + userContent);
        assertTrue(userContent.contains("CONTROLLER: UserController"));
        assertTrue(userContent.contains("Var AppConfig"), "Controller file should contain Var AppConfig");
        assertTrue(userContent.contains("- baseUrl: 'http://localhost:8080'"));
        assertTrue(userContent.contains("Api POST #create"));
        assertTrue(userContent.contains("Url {{baseUrl}}/api/v1/users"));
        assertTrue(userContent.contains("Task User Lifecycle Workflow"));

        // 4. Verify order controller file content
        String orderContent = Files.readString(orderControllerFile);
        System.out.println("------ ORDER CONTROLLER FILE CONTENT ------\n" + orderContent);
        assertTrue(orderContent.contains("CONTROLLER: OrderController"));
        assertTrue(orderContent.contains("Var AppConfig"), "Controller file should contain Var AppConfig");
        assertTrue(orderContent.contains("Api POST #createOrder"));
        assertTrue(orderContent.contains("Url {{baseUrl}}/api/v1/orders"));
        assertTrue(orderContent.contains("Task Order Lifecycle Workflow"));

        // Reset configuration for other tests
        properties.setSplitByController(true);
    }

    @Test
    void testTasksDisabledConfiguration() throws IOException {
        // Test single file with tasks disabled
        properties.setSplitByController(false);
        properties.setGenerateTasks(false);

        String singleBerryDsl = generatorService.generateBerryDsl();
        assertFalse(singleBerryDsl.contains("Task User Lifecycle Workflow"), "Should not contain tasks when inferWorkflows/generateTasks is false");
        assertFalse(singleBerryDsl.contains("Task Order Lifecycle Workflow"), "Should not contain tasks when inferWorkflows/generateTasks is false");
        assertTrue(singleBerryDsl.contains("Api POST #create"), "Should still contain API blocks");

        // Test split-by-controller with tasks disabled
        properties.setSplitByController(true);
        Path modularPath = Path.of("target/flexiberry/notasks/application.berry");
        List<Path> writtenFiles = generatorService.writeBerryFiles(modularPath);

        String rootContent = Files.readString(modularPath);
        assertFalse(rootContent.contains("Task User Lifecycle Workflow"), "Root should not contain tasks when disabled");
        assertFalse(rootContent.contains("Task Order Lifecycle Workflow"), "Root should not contain tasks when disabled");
        assertTrue(rootContent.contains("Link ./controllers/"), "Root should still contain Links");

        Path userFile = modularPath.getParent().resolve("controllers/user-controller.berry");
        String userContent = Files.readString(userFile);
        assertFalse(userContent.contains("Task User Lifecycle Workflow"), "Controller file should not contain tasks when disabled");
        assertTrue(userContent.contains("Api POST #create"), "Controller file should still contain APIs");

        // Reset
        properties.setGenerateTasks(true);
        properties.setSplitByController(true);
    }

    @Test
    void testBaseUrlConfiguredViaProperties() {
        properties.setSplitByController(false);
        properties.setUseBaseUrlVariable(true);
        properties.setBaseUrl("https://api.mycompany.com:9000/");

        String berryDsl = generatorService.generateBerryDsl();
        assertTrue(berryDsl.contains("- baseUrl: 'https://api.mycompany.com:9000'"), "Base URL from properties should be reflected in Var entry without trailing slash");
        assertTrue(berryDsl.contains("Url {{baseUrl}}/api/v1/users/{{id}}"), "Endpoints should append {{baseUrl}} with path");

        // Reset
        properties.setBaseUrl("http://localhost:8080");
    }

    @Test
    void testCustomBaseUrlVariableName() {
        properties.setSplitByController(false);
        properties.setUseBaseUrlVariable(true);
        properties.setBaseUrl("https://gateway.example.com");
        properties.setBaseUrlVariableName("gatewayUrl");

        String berryDsl = generatorService.generateBerryDsl();
        assertTrue(berryDsl.contains("- gatewayUrl: 'https://gateway.example.com'"), "Should use custom variable name in Var block");
        assertTrue(berryDsl.contains("Url {{gatewayUrl}}/api/v1/users/{{id}}"), "Should append custom variable name with endpoint");

        // Reset
        properties.setBaseUrl("http://localhost:8080");
        properties.setBaseUrlVariableName("baseUrl");
    }

    @Test
    void testDirectBaseUrlWithoutVariable() {
        properties.setSplitByController(false);
        properties.setUseBaseUrlVariable(false);
        properties.setBaseUrl("http://localhost:8080");

        String berryDsl = generatorService.generateBerryDsl();
        assertFalse(berryDsl.contains("Var AppConfig"), "Should not emit Var AppConfig when variable is disabled");
        assertTrue(berryDsl.contains("Url http://localhost:8080/api/v1/users/{{id}}"), "Should inline raw base URL when variable is disabled");

        // Reset
        properties.setUseBaseUrlVariable(true);
        properties.setSplitByController(true);
    }

    @Test
    void testDefaultSplitByControllerIsTrue() {
        FlexiberryProperties defaultProps = new FlexiberryProperties();
        assertTrue(defaultProps.isSplitByController(), "splitByController must default to true");
    }
}
