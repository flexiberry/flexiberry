package io.flexiberry.springboot.scanner;

import io.flexiberry.springboot.FlexiberryProperties;
import org.springframework.core.MethodParameter;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.mvc.method.RequestMappingInfo;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.lang.reflect.Method;
import java.lang.reflect.Type;
import java.util.*;

/**
 * Scans Spring MVC RequestMappingHandlerMapping to extract type-safe route endpoints.
 */
public class SpringRouteScanner {

    private final RequestMappingHandlerMapping handlerMapping;
    private final FlexiberryProperties properties;
    private final DtoPayloadGenerator payloadGenerator;

    public SpringRouteScanner(RequestMappingHandlerMapping handlerMapping, FlexiberryProperties properties) {
        this.handlerMapping = handlerMapping;
        this.properties = properties;
        this.payloadGenerator = new DtoPayloadGenerator();
    }

    public List<DiscoveredEndpoint> scanEndpoints() {
        List<DiscoveredEndpoint> endpoints = new ArrayList<>();
        Map<RequestMappingInfo, HandlerMethod> handlerMethods = handlerMapping.getHandlerMethods();
        Set<String> usedApiIds = new HashSet<>();

        for (Map.Entry<RequestMappingInfo, HandlerMethod> entry : handlerMethods.entrySet()) {
            RequestMappingInfo info = entry.getKey();
            HandlerMethod handlerMethod = entry.getValue();

            Class<?> beanType = handlerMethod.getBeanType();
            String className = beanType.getName();

            // Skip internal Spring controllers
            if (className.startsWith("org.springframework.boot.autoconfigure.web") ||
                className.contains("BasicErrorController") ||
                className.contains("FlexiberryExportController")) {
                continue;
            }

            // Optional basePackage filter
            if (!properties.getBasePackages().isEmpty()) {
                boolean matches = properties.getBasePackages().stream().anyMatch(className::startsWith);
                if (!matches) continue;
            }

            Set<String> paths = extractPatterns(info);
            Set<RequestMethod> methods = info.getMethodsCondition().getMethods();

            if (paths.isEmpty()) continue;

            // Default to GET if no explicit method
            List<RequestMethod> effectiveMethods = methods.isEmpty()
                ? List.of(RequestMethod.GET)
                : new ArrayList<>(methods);

            for (String rawPath : paths) {
                for (RequestMethod requestMethod : effectiveMethods) {
                    DiscoveredEndpoint ep = processEndpoint(rawPath, requestMethod, handlerMethod, usedApiIds);
                    endpoints.add(ep);
                }
            }
        }

        // Sort by path, then method
        endpoints.sort(Comparator.comparing(DiscoveredEndpoint::rawPath)
                                 .thenComparing(DiscoveredEndpoint::method));
        return endpoints;
    }

    private DiscoveredEndpoint processEndpoint(String rawPath, RequestMethod requestMethod,
                                               HandlerMethod handlerMethod, Set<String> usedApiIds) {
        Method method = handlerMethod.getMethod();
        String controllerName = handlerMethod.getBeanType().getSimpleName();
        String methodName = method.getName();

        // 1. Build unique Api ID
        String baseId = methodName;
        String apiId = baseId;
        int counter = 1;
        while (usedApiIds.contains(apiId)) {
            apiId = baseId + "_" + counter++;
        }
        usedApiIds.add(apiId);

        // 2. Extract path variables and convert {param} -> {{param}}
        List<String> pathVars = new ArrayList<>();
        List<String> queryParams = new ArrayList<>();
        Type requestBodyType = null;
        Map<String, String> headers = new LinkedHashMap<>();

        for (MethodParameter param : handlerMethod.getMethodParameters()) {
            if (param.hasParameterAnnotation(PathVariable.class)) {
                PathVariable pv = param.getParameterAnnotation(PathVariable.class);
                String name = (pv != null && !pv.value().isBlank()) ? pv.value() : param.getParameterName();
                if (name != null) pathVars.add(name);
            } else if (param.hasParameterAnnotation(RequestParam.class)) {
                RequestParam rp = param.getParameterAnnotation(RequestParam.class);
                String name = (rp != null && !rp.value().isBlank()) ? rp.value() : param.getParameterName();
                if (name != null) queryParams.add(name);
            } else if (param.hasParameterAnnotation(RequestBody.class)) {
                requestBodyType = param.getGenericParameterType();
            } else if (param.hasParameterAnnotation(RequestHeader.class)) {
                RequestHeader rh = param.getParameterAnnotation(RequestHeader.class);
                String name = (rh != null && !rh.value().isBlank()) ? rh.value() : param.getParameterName();
                if (name != null) headers.put(name, "");
            }
        }

        // Normalize URL to {{param}}
        String berryPath = rawPath.replaceAll("\\{([a-zA-Z0-9_]+)\\}", "{{$1}}");
        String fullUrl = properties.getBaseUrl().replaceAll("/+$", "") +
                         (berryPath.startsWith("/") ? berryPath : "/" + berryPath);

        // Add query parameters to URL if any
        if (!queryParams.isEmpty()) {
            StringBuilder qs = new StringBuilder();
            for (int i = 0; i < queryParams.size(); i++) {
                qs.append(i == 0 ? "?" : "&")
                  .append(queryParams.get(i))
                  .append("={{")
                  .append(queryParams.get(i))
                  .append("}}");
            }
            fullUrl += qs.toString();
        }

        // Generate JSON body if request body is present
        String bodyJson = null;
        if (requestBodyType != null) {
            headers.putIfAbsent("Content-Type", "application/json");
            bodyJson = payloadGenerator.generateSampleJson(requestBodyType);
        }
        headers.putIfAbsent("Accept", "application/json");

        String title = String.format("%s (%s.%s)", humanize(methodName), controllerName, methodName);
        Type returnType = handlerMethod.getReturnType().getGenericParameterType();

        return new DiscoveredEndpoint(
            requestMethod.name(),
            fullUrl,
            rawPath,
            apiId,
            title,
            controllerName,
            handlerMethod.getBeanType(),
            methodName,
            headers,
            pathVars,
            queryParams,
            requestBodyType,
            bodyJson,
            returnType
        );
    }

    @SuppressWarnings("unchecked")
    private Set<String> extractPatterns(RequestMappingInfo info) {
        // 1. Try Spring 5.3+ / Spring 6 / Spring Boot 3 & 4 PathPatternsCondition
        try {
            Method getPathPatterns = info.getClass().getMethod("getPathPatternsCondition");
            Object condition = getPathPatterns.invoke(info);
            if (condition != null) {
                Method getPatternValues = condition.getClass().getMethod("getPatternValues");
                Set<String> values = (Set<String>) getPatternValues.invoke(condition);
                if (values != null && !values.isEmpty()) {
                    return values;
                }
            }
        } catch (Throwable ignored) {
            // Not available on Spring 3 / 4 / early Spring Boot 2
        }

        // 2. Fallback to PatternsCondition (Spring 3, 4, 5 / Spring Boot 2)
        try {
            Method getPatternsMethod = info.getClass().getMethod("getPatternsCondition");
            Object condition = getPatternsMethod.invoke(info);
            if (condition != null) {
                Method getPatterns = condition.getClass().getMethod("getPatterns");
                Set<String> patterns = (Set<String>) getPatterns.invoke(condition);
                if (patterns != null && !patterns.isEmpty()) {
                    return patterns;
                }
            }
        } catch (Throwable ignored) {
            // Invocation error
        }

        return Collections.emptySet();
    }


    private String humanize(String identifier) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < identifier.length(); i++) {
            char c = identifier.charAt(i);
            if (i > 0 && Character.isUpperCase(c)) {
                sb.append(' ');
            }
            sb.append(i == 0 ? Character.toUpperCase(c) : Character.toLowerCase(c));
        }
        return sb.toString();
    }
}
