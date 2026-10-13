package io.flexiberry.springboot.scanner;

import java.lang.reflect.Type;
import java.util.*;

/**
 * Metadata representing a discovered Spring MVC / WebFlux route handler.
 */
public record DiscoveredEndpoint(
    String method,
    String path,
    String rawPath,
    String apiId,
    String title,
    String controllerName,
    Class<?> controllerClass,
    String methodName,
    Map<String, String> headers,
    List<String> pathVariables,
    List<String> queryParams,
    Type requestBodyType,
    String requestBodyJson,
    Type responseType
) {}
