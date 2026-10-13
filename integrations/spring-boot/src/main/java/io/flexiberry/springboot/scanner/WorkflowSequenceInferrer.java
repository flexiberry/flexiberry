package io.flexiberry.springboot.scanner;

import io.flexiberry.springboot.BerryWriter;

import java.util.*;

/**
 * Infers sequential, multi-step CRUD lifecycle workflows
 * from discovered Spring Boot endpoints and emits them into BerryWriter.
 */
public class WorkflowSequenceInferrer {

    public void inferWorkflows(List<DiscoveredEndpoint> endpoints, BerryWriter writer) {
        // Group endpoints by controller or base path
        Map<String, List<DiscoveredEndpoint>> grouped = new LinkedHashMap<>();
        for (DiscoveredEndpoint ep : endpoints) {
            grouped.computeIfAbsent(ep.controllerName(), k -> new ArrayList<>()).add(ep);
        }

        for (Map.Entry<String, List<DiscoveredEndpoint>> entry : grouped.entrySet()) {
            String controllerName = entry.getKey();
            List<DiscoveredEndpoint> controllerEndpoints = entry.getValue();

            inferControllerLifecycle(controllerName, controllerEndpoints, writer);
        }
    }

    public void inferControllerLifecycle(String controllerName, List<DiscoveredEndpoint> endpoints, BerryWriter writer) {
        DiscoveredEndpoint postEndpoint = null;
        DiscoveredEndpoint getByIdEndpoint = null;
        DiscoveredEndpoint putEndpoint = null;
        DiscoveredEndpoint deleteEndpoint = null;
        DiscoveredEndpoint getAllEndpoint = null;

        for (DiscoveredEndpoint ep : endpoints) {
            boolean hasIdParam = !ep.pathVariables().isEmpty();
            switch (ep.method()) {
                case "POST" -> { if (postEndpoint == null) postEndpoint = ep; }
                case "GET" -> {
                    if (hasIdParam && getByIdEndpoint == null) getByIdEndpoint = ep;
                    else if (!hasIdParam && getAllEndpoint == null) getAllEndpoint = ep;
                }
                case "PUT", "PATCH" -> { if (putEndpoint == null && hasIdParam) putEndpoint = ep; }
                case "DELETE" -> { if (deleteEndpoint == null && hasIdParam) deleteEndpoint = ep; }
            }
        }

        // Need at least 2 endpoints to form a meaningful sequential workflow
        int foundCount = (postEndpoint != null ? 1 : 0) +
                         (getByIdEndpoint != null ? 1 : 0) +
                         (putEndpoint != null ? 1 : 0) +
                         (deleteEndpoint != null ? 1 : 0);

        if (foundCount < 2) return;

        String taskTitle = cleanControllerName(controllerName) + " Lifecycle Workflow";
        BerryWriter.TaskBuilder task = writer.task(taskTitle);

        String idVariable = "createdId";

        // Step 1: POST (Create)
        if (postEndpoint != null) {
            Map<String, String> capture = new LinkedHashMap<>();
            capture.put(idVariable, "response.body.id");
            capture.put("createStatus", "response.status");

            List<String> checks = List.of(
                "createStatus == 201 OR createStatus == 200",
                idVariable + " != null"
            );
            task.step(postEndpoint.apiId(), null, capture, checks);
        }

        // Step 2: GET by ID
        if (getByIdEndpoint != null) {
            Map<String, String> params = new LinkedHashMap<>();
            for (String pv : getByIdEndpoint.pathVariables()) {
                params.put(pv, idVariable);
            }
            List<String> checks = List.of(
                "$.status == 200",
                "response.body.id == " + idVariable
            );
            task.step(getByIdEndpoint.apiId(), params, null, checks);
        }

        // Step 3: PUT (Update)
        if (putEndpoint != null) {
            Map<String, String> params = new LinkedHashMap<>();
            for (String pv : putEndpoint.pathVariables()) {
                params.put(pv, idVariable);
            }
            List<String> checks = List.of("$.status == 200");
            task.step(putEndpoint.apiId(), params, null, checks);
        }

        // Step 4: DELETE
        if (deleteEndpoint != null) {
            Map<String, String> params = new LinkedHashMap<>();
            for (String pv : deleteEndpoint.pathVariables()) {
                params.put(pv, idVariable);
            }
            List<String> checks = List.of("$.status == 204 OR $.status == 200");
            task.step(deleteEndpoint.apiId(), params, null, checks);
        }

        task.endTask();
    }

    private String cleanControllerName(String name) {
        if (name.endsWith("Controller")) {
            return name.substring(0, name.length() - "Controller".length());
        }
        return name;
    }
}
