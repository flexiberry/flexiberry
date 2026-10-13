package io.flexiberry.springboot;

import java.util.*;

/**
 * Fluent builder for generating syntactically valid .berry DSL scripts.
 */
public class BerryWriter {

    private final StringBuilder sb = new StringBuilder();
    private final int indentSize;

    public BerryWriter() {
        this(4);
    }

    public BerryWriter(int indentSize) {
        this.indentSize = indentSize;
    }

    private String indent(int level) {
        return " ".repeat(level * indentSize);
    }

    public BerryWriter comment(String text) {
        sb.append("## ").append(text).append("\n");
        return this;
    }

    public BerryWriter blankLine() {
        sb.append("\n");
        return this;
    }

    public BerryWriter link(String path) {
        sb.append("Link ").append(path.trim()).append("\n");
        return this;
    }

    public BerryWriter var(String name, String pointer, Map<String, Object> entries) {
        sb.append("Var");
        if (pointer != null && !pointer.isBlank()) {
            sb.append(" @").append(pointer);
        }
        if (name != null && !name.isBlank()) {
            sb.append(" ").append(name);
        }
        sb.append("\n");

        if (entries != null) {
            for (Map.Entry<String, Object> entry : entries.entrySet()) {
                sb.append(indent(1))
                  .append("- ")
                  .append(entry.getKey())
                  .append(": ");
                Object val = entry.getValue();
                if (val instanceof String s && !s.startsWith("@")) {
                    sb.append("'").append(s).append("'");
                } else {
                    sb.append(val);
                }
                sb.append("\n");
            }
        }
        sb.append("\n");
        return this;
    }

    public BerryWriter api(String method, String id, String title, String url,
                           Map<String, String> headers, String bodyJson) {
        sb.append("Api ").append(method.toUpperCase()).append(" #").append(id);
        if (title != null && !title.isBlank()) {
            sb.append(" ").append(title.trim());
        }
        sb.append("\n");

        sb.append("Url ").append(url.trim()).append("\n");

        if (headers != null && !headers.isEmpty()) {
            sb.append("Header\n");
            for (Map.Entry<String, String> h : headers.entrySet()) {
                sb.append("- ").append(h.getKey()).append(": '").append(h.getValue()).append("'\n");
            }
        }

        if (bodyJson != null && !bodyJson.isBlank()) {
            sb.append("Body JSON `\n").append(bodyJson.trim()).append("\n`\n");
        }

        sb.append("\n");
        return this;
    }

    public static class TaskBuilder {
        private final BerryWriter parent;
        private final String title;
        private final List<StepDef> steps = new ArrayList<>();

        public TaskBuilder(BerryWriter parent, String title) {
            this.parent = parent;
            this.title = title;
        }

        public TaskBuilder step(String apiId, Map<String, String> params,
                                Map<String, String> capture, List<String> checks) {
            steps.add(new StepDef(apiId, params, capture, checks));
            return this;
        }

        public BerryWriter endTask() {
            parent.sb.append("Task ").append(title).append("\n");
            for (StepDef step : steps) {
                parent.sb.append(parent.indent(1))
                         .append("Step Call Api ")
                         .append(step.apiId)
                         .append("\n");

                if (step.params != null && !step.params.isEmpty()) {
                    parent.sb.append(parent.indent(2)).append("Params\n");
                    for (Map.Entry<String, String> p : step.params.entrySet()) {
                        parent.sb.append(parent.indent(2))
                                 .append("- ")
                                 .append(p.getKey())
                                 .append(": ")
                                 .append(p.getValue())
                                 .append("\n");
                    }
                }

                if (step.capture != null && !step.capture.isEmpty()) {
                    parent.sb.append(parent.indent(2)).append("Capture\n");
                    for (Map.Entry<String, String> c : step.capture.entrySet()) {
                        parent.sb.append(parent.indent(2))
                                 .append("- ")
                                 .append(c.getKey())
                                 .append(": ")
                                 .append(c.getValue())
                                 .append("\n");
                    }
                }

                if (step.checks != null && !step.checks.isEmpty()) {
                    parent.sb.append(parent.indent(2)).append("Check\n");
                    for (String chk : step.checks) {
                        parent.sb.append(parent.indent(2))
                                 .append("- ")
                                 .append(chk)
                                 .append("\n");
                    }
                }
            }
            parent.sb.append("\n");
            return parent;
        }

        private record StepDef(String apiId, Map<String, String> params,
                              Map<String, String> capture, List<String> checks) {}
    }

    public TaskBuilder task(String title) {
        return new TaskBuilder(this, title);
    }

    public String build() {
        return sb.toString();
    }
}
