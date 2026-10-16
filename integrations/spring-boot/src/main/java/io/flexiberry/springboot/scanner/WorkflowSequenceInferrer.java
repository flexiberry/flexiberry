package io.flexiberry.springboot.scanner;

import io.flexiberry.springboot.BerryWriter;

import java.util.*;

/**
 * Infers sequential, multi-step CRUD lifecycle workflows
 * from discovered Spring Boot endpoints and emits them into BerryWriter.
 */
public class WorkflowSequenceInferrer {

    public boolean inferWorkflows(List<DiscoveredEndpoint> endpoints, BerryWriter writer) {
        // Group endpoints by controller or base path
        Map<String, List<DiscoveredEndpoint>> grouped = new LinkedHashMap<>();
        for (DiscoveredEndpoint ep : endpoints) {
            grouped.computeIfAbsent(ep.controllerName(), k -> new ArrayList<>()).add(ep);
        }

        boolean anyTask = false;
        for (Map.Entry<String, List<DiscoveredEndpoint>> entry : grouped.entrySet()) {
            String controllerName = entry.getKey();
            List<DiscoveredEndpoint> controllerEndpoints = entry.getValue();

            if (inferControllerLifecycle(controllerName, controllerEndpoints, writer)) {
                anyTask = true;
            }
        }
        return anyTask;
    }

    public boolean inferControllerLifecycle(String controllerName, List<DiscoveredEndpoint> endpoints, BerryWriter writer) {
        DiscoveredEndpoint postEndpoint = null;
        DiscoveredEndpoint getByIdEndpoint = null;
        DiscoveredEndpoint putEndpoint = null;
        DiscoveredEndpoint deleteEndpoint = null;
        DiscoveredEndpoint getAllEndpoint = null;

        for (DiscoveredEndpoint ep : endpoints) {
            boolean hasIdParam = !ep.pathVariables().isEmpty() || (ep.rawPath() != null && ep.rawPath().contains("{"));
            switch (ep.method()) {
                case "POST" -> {
                    // Prefer creation POST (without path variable)
                    if (postEndpoint == null || (!hasIdParam && (postEndpoint.rawPath().contains("{") || !postEndpoint.pathVariables().isEmpty()))) {
                        postEndpoint = ep;
                    }
                }
                case "GET" -> {
                    if (hasIdParam && getByIdEndpoint == null) {
                        getByIdEndpoint = ep;
                    } else if (!hasIdParam && getAllEndpoint == null) {
                        getAllEndpoint = ep;
                    }
                }
                case "PUT", "PATCH" -> {
                    if (putEndpoint == null || (hasIdParam && !putEndpoint.rawPath().contains("{"))) {
                        putEndpoint = ep;
                    }
                }
                case "DELETE" -> {
                    if (deleteEndpoint == null || (hasIdParam && !deleteEndpoint.rawPath().contains("{"))) {
                        deleteEndpoint = ep;
                    }
                }
            }
        }

        // Need at least 2 endpoints to form a meaningful sequential workflow
        int foundCount = (postEndpoint != null ? 1 : 0) +
                         (getByIdEndpoint != null ? 1 : 0) +
                         (getAllEndpoint != null ? 1 : 0) +
                         (putEndpoint != null ? 1 : 0) +
                         (deleteEndpoint != null ? 1 : 0);

        if (foundCount < 2) return false;

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
            List<String> pvs = extractPathVars(getByIdEndpoint);
            if (pvs.isEmpty()) {
                params.put("id", idVariable);
            } else {
                for (String pv : pvs) {
                    params.put(pv, idVariable);
                }
            }
            List<String> checks = List.of(
                "$.status == 200",
                "response.body.id == " + idVariable
            );
            task.step(getByIdEndpoint.apiId(), params, null, checks);
        } else if (getAllEndpoint != null && postEndpoint != null) {
            // Fallback to GET all if getById is not available
            List<String> checks = List.of("$.status == 200");
            task.step(getAllEndpoint.apiId(), null, null, checks);
        }

        // Step 3: PUT (Update)
        if (putEndpoint != null) {
            Map<String, String> params = new LinkedHashMap<>();
            List<String> pvs = extractPathVars(putEndpoint);
            if (!pvs.isEmpty()) {
                for (String pv : pvs) {
                    params.put(pv, idVariable);
                }
            }
            List<String> checks = List.of("$.status == 200");
            task.step(putEndpoint.apiId(), params.isEmpty() ? null : params, null, checks);
        }

        // Step 4: DELETE
        if (deleteEndpoint != null) {
            Map<String, String> params = new LinkedHashMap<>();
            List<String> pvs = extractPathVars(deleteEndpoint);
            if (!pvs.isEmpty()) {
                for (String pv : pvs) {
                    params.put(pv, idVariable);
                }
            }
            List<String> checks = List.of("$.status == 204 OR $.status == 200");
            task.step(deleteEndpoint.apiId(), params.isEmpty() ? null : params, null, checks);
        }

        task.endTask();
        return true;
    }

    private List<String> extractPathVars(DiscoveredEndpoint ep) {
        if (!ep.pathVariables().isEmpty()) {
            return ep.pathVariables();
        }
        List<String> result = new ArrayList<>();
        if (ep.rawPath() != null) {
            java.util.regex.Matcher m = java.util.regex.Pattern.compile("\\{([a-zA-Z0-9_]+)\\}").matcher(ep.rawPath());
            while (m.find()) {
                result.add(m.group(1));
            }
        }
        return result;
    }

    private String cleanControllerName(String name) {
        if (name.endsWith("Controller")) {
            return name.substring(0, name.length() - "Controller".length());
        }
        return name;
    }
}
