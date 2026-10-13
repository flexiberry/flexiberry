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

        String berryDsl = generatorService.generateBerryDsl();
        assertNotNull(berryDsl);
        assertFalse(berryDsl.isBlank());

        System.out.println("====== SINGLE FILE .BERRY DSL ======");
        System.out.println(berryDsl);
        System.out.println("====================================");

        // Verify API blocks for both controllers
        assertTrue(berryDsl.contains("Api POST #create"), "Should contain UserController.create");
        assertTrue(berryDsl.contains("Api POST #createOrder"), "Should contain OrderController.createOrder");
        assertTrue(berryDsl.contains("Url http://localhost:8080/api/v1/users/{{id}}"), "Should normalize user path variable");
        assertTrue(berryDsl.contains("Url http://localhost:8080/api/v1/orders/{{orderId}}"), "Should normalize order path variable");

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

        // 2. Verify Root file contains Link statements
        String rootContent = Files.readString(mainPath);
        System.out.println("------ ROOT FILE CONTENT ------\n" + rootContent);
        assertTrue(rootContent.contains("Link ./controllers/user-controller.berry"), "Root must link user-controller");
        assertTrue(rootContent.contains("Link ./controllers/order-controller.berry"), "Root must link order-controller");
        assertFalse(rootContent.contains("Api POST #createOrder"), "Root should not duplicate API blocks");

        // 3. Verify user controller file content
        String userContent = Files.readString(userControllerFile);
        System.out.println("------ USER CONTROLLER FILE CONTENT ------\n" + userContent);
        assertTrue(userContent.contains("CONTROLLER: UserController"));
        assertTrue(userContent.contains("Api POST #create"));
        assertTrue(userContent.contains("Task User Lifecycle Workflow"));

        // 4. Verify order controller file content
        String orderContent = Files.readString(orderControllerFile);
        System.out.println("------ ORDER CONTROLLER FILE CONTENT ------\n" + orderContent);
        assertTrue(orderContent.contains("CONTROLLER: OrderController"));
        assertTrue(orderContent.contains("Api POST #createOrder"));
        assertTrue(orderContent.contains("Task Order Lifecycle Workflow"));

        // Reset configuration for other tests
        properties.setSplitByController(false);
    }
}
