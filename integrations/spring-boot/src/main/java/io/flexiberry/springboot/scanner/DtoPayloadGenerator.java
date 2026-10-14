package io.flexiberry.springboot.scanner;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import java.lang.reflect.*;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;

/**
 * Introspects DTO classes and Java Records to generate realistic,
 * pretty-printed sample JSON payloads for request bodies.
 */
public class DtoPayloadGenerator {

    private final ObjectMapper objectMapper;
    private final Set<Class<?>> visited = new HashSet<>();

    public DtoPayloadGenerator() {
        this.objectMapper = new ObjectMapper().enable(SerializationFeature.INDENT_OUTPUT);
    }

    public String generateSampleJson(Type type) {
        if (type == null) return null;
        try {
            visited.clear();
            Object sampleObj = instantiateSample(type, 0);
            if (sampleObj == null) return null;
            return objectMapper.writeValueAsString(sampleObj);
        } catch (Exception e) {
            return "{}";
        }
    }

    private Object instantiateSample(Type type, int depth) {
        if (depth > 5) return null;

        if (type instanceof Class<?> clazz) {
            return createSampleForClass(clazz, depth);
        } else if (type instanceof ParameterizedType pt) {
            Type rawType = pt.getRawType();
            if (rawType instanceof Class<?> rawClass) {
                if (Collection.class.isAssignableFrom(rawClass)) {
                    Type itemType = pt.getActualTypeArguments().length > 0 ? pt.getActualTypeArguments()[0] : Object.class;
                    Object item = instantiateSample(itemType, depth + 1);
                    return item != null ? List.of(item) : List.of();
                } else if (Map.class.isAssignableFrom(rawClass)) {
                    Type valType = pt.getActualTypeArguments().length > 1 ? pt.getActualTypeArguments()[1] : Object.class;
                    Object val = instantiateSample(valType, depth + 1);
                    return val != null ? Map.of("key", val) : Map.of();
                }
                return createSampleForClass(rawClass, depth);
            }
        }
        return null;
    }

    private Object createSampleForClass(Class<?> clazz, int depth) {
        if (clazz == String.class) return "sample_" + clazz.getSimpleName().toLowerCase();
        if (clazz == Integer.class || clazz == int.class) return 100;
        if (clazz == Long.class || clazz == long.class) return 1000L;
        if (clazz == Double.class || clazz == double.class) return 19.99;
        if (clazz == Float.class || clazz == float.class) return 9.99f;
        if (clazz == Boolean.class || clazz == boolean.class) return true;
        if (clazz == BigDecimal.class) return new BigDecimal("99.95");
        if (clazz == UUID.class) return UUID.randomUUID().toString();
        if (clazz == LocalDate.class) return LocalDate.now().toString();
        if (clazz == LocalDateTime.class) return LocalDateTime.now().toString();
        if (clazz == Instant.class) return Instant.now().toString();

        if (clazz.isEnum()) {
            Object[] constants = clazz.getEnumConstants();
            return constants.length > 0 ? constants[0].toString() : "ACTIVE";
        }

        if (visited.contains(clazz)) return null;
        visited.add(clazz);

        // Handle Java Records (reflective check for Java 8 / 11 compatibility)
        if (isRecordClass(clazz)) {
            Map<String, Object> recordMap = new LinkedHashMap<>();
            try {
                Method getComponentsMethod = Class.class.getMethod("getRecordComponents");
                Object[] components = (Object[]) getComponentsMethod.invoke(clazz);
                if (components != null) {
                    for (Object comp : components) {
                        Method getNameMethod = comp.getClass().getMethod("getName");
                        Method getGenericTypeMethod = comp.getClass().getMethod("getGenericType");
                        String name = (String) getNameMethod.invoke(comp);
                        Type compType = (Type) getGenericTypeMethod.invoke(comp);
                        Object val = instantiateSample(compType, depth + 1);
                        recordMap.put(name, val != null ? val : "sample_" + name);
                    }
                    return recordMap;
                }
            } catch (Throwable ignored) {
                // Fallback to standard POJO field introspection
            }
        }

        // Standard POJOs
        Map<String, Object> map = new LinkedHashMap<>();
        Class<?> current = clazz;
        while (current != null && current != Object.class) {
            for (Field field : current.getDeclaredFields()) {
                if (Modifier.isStatic(field.getModifiers()) || Modifier.isTransient(field.getModifiers())) {
                    continue;
                }
                String name = field.getName();
                Object val = instantiateSample(field.getGenericType(), depth + 1);
                map.put(name, val != null ? val : "sample_" + name);
            }
            current = current.getSuperclass();
        }

        return map.isEmpty() ? null : map;
    }

    private boolean isRecordClass(Class<?> clazz) {
        try {
            Method isRecordMethod = Class.class.getMethod("isRecord");
            return (Boolean) isRecordMethod.invoke(clazz);
        } catch (Throwable t) {
            return false;
        }
    }
}

