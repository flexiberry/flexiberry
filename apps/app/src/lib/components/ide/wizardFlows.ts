import { FormatUtil } from "@flexiberry/berrycore";

export type WizardPromptType = "text" | "select" | "confirm";

export interface WizardStep {
  id: string;
  type: WizardPromptType;
  message: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  condition?: (answers: Record<string, any>) => boolean;
  suggestions?: string[];
}

export const apiFlow: WizardStep[] = [
  {
    id: "name",
    type: "text",
    message: "What is the name of this API?",
    placeholder: "Api Name",
  },
  {
    id: "url",
    type: "text",
    message: "Please enter the API URL",
    placeholder: "https://api.example.com",
  },
  {
    id: "method",
    type: "select",
    message: "Choose the HTTP method",
    options: [
      { value: "GET", label: "GET — Retrieve data" },
      { value: "POST", label: "POST — Create a resource" },
      { value: "PUT", label: "PUT — Replace a resource" },
      { value: "PATCH", label: "PATCH — Partially update a resource" },
      { value: "DELETE", label: "DELETE — Remove a resource" },
    ],
  },
  {
    id: "hasHeaders",
    type: "confirm",
    message: "Do you want to add request headers?",
  },
  {
    id: "headers",
    type: "text",
    message: "Enter headers as comma-separated key:value pairs",
    placeholder: "Content-Type:application/json , Authorization:Bearer token",
    condition: (ans) => ans.hasHeaders,
  },
  {
    id: "hasBody",
    type: "confirm",
    message: "Does this API have a request body?",
  },
  {
    id: "bodyType",
    type: "select",
    message: "Choose the body content type",
    condition: (ans) => ans.hasBody,
    options: [
      { value: "JSON", label: "JSON" },
      { value: "XML", label: "XML" },
      { value: "TEXT", label: "Plain Text" },
      { value: "GRAPHQL", label: "GraphQL" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    id: "body",
    type: "text",
    message: "Enter the request body payload",
    placeholder: '{ "key": "value" }',
    condition: (ans) => ans.hasBody,
  },
];

export const varFlow: WizardStep[] = [
  {
    id: "title",
    type: "text",
    message: "Enter a title for this variable block",
    placeholder: "myVar",
  },
  {
    id: "env",
    type: "text",
    message:
      "Enter the environment pointer this variable block belongs to (optional)",
    placeholder: "",
  },
  {
    id: "variables",
    type: "text",
    message: "Enter variables as comma-separated key:value pairs",
    placeholder: "baseUrl:https://api.example.com , timeout:5000",
  },
];

export const envFlow: WizardStep[] = [
  {
    id: "environments",
    type: "text",
    message: "Please enter environment names (comma-separated)",
    placeholder: "SIT, UAT, PROD",
  },
];

export const taskFlow: WizardStep[] = [
  {
    id: "name",
    type: "text",
    message: "What is the task name?",
    placeholder: "myTask",
  },
];

export const stepFlow: WizardStep[] = [
  {
    id: "action",
    type: "select",
    message: "Choose Action Type",
    options: [
      { value: "Call Api", label: "Call Api — Execute an API request" },
    ],
  },
  {
    id: "api",
    type: "select",
    message: "Select the API to call",
    options: [], // Populated dynamically in InteractiveWizard
  },
  {
    id: "hasCapture",
    type: "confirm",
    message: "Do you need to capture anything from the response?",
  },
  {
    id: "capture",
    type: "text",
    message: "Enter capture mappings as comma-separated key:value pairs",
    placeholder: "id:response.id , status:response.status",
    condition: (ans) => ans.hasCapture,
  },
  {
    id: "hasCheck",
    type: "confirm",
    message: "Do you need to assert/check response values?",
  },
  {
    id: "check",
    type: "text",
    message: "Enter check conditions (comma-separated)",
    placeholder: "$.status == 200 , $.body != null",
    condition: (ans) => ans.hasCheck,
  },
];

export function buildCodeFromAnswers(
  type: "Api" | "Var" | "Task" | "Env" | "Step",
  answers: Record<string, any>,
): string {
  if (type === "Api") {
    let payload = answers.body || "";
    if (answers.bodyType === "JSON") {
      try {
        payload = JSON.stringify(JSON.parse(payload), null, 2);
      } catch (e) {
        // ignore
      }
    }
    return FormatUtil.buildApi(answers.name, {
      method: answers.method,
      url: answers.url,
      headers: answers.headers || undefined,
      body: payload || undefined,
      bodyType: answers.bodyType || undefined,
    });
  } else if (type === "Var") {
    const title = answers.title || "myVar";
    const env = answers.env || undefined;
    const variables = answers.variables
      ? answers.variables.split(",").map((v: string) => v.trim())
      : [];
    return FormatUtil.buildVar(title, variables, env);
  } else if (type === "Env") {
    const environments = answers.environments
      ? answers.environments.split(",").map((e: string) => e.trim())
      : [];
    return FormatUtil.buildEnv(environments);
  } else if (type === "Task") {
    const name = answers.name || "myTask";
    return `Task ${name}`;
  } else if (type === "Step") {
    const action = answers.action || "Call Api";
    const api = answers.api || "myApi";
    let code = `    Step ${action} ${api}`;

    // Dynamic parameters prefixed with param_
    const paramKeys = Object.keys(answers).filter((k) =>
      k.startsWith("param_"),
    );
    if (paramKeys.length > 0) {
      code += "\n        Params";
      for (const key of paramKeys) {
        const paramName = key.replace("param_", "");
        const paramVal = answers[key];
        if (paramVal) {
          code += `\n        - ${paramName}: ${paramVal}`;
        }
      }
    }

    if (answers.hasCapture && answers.capture) {
      code += "\n        Capture";
      const pairs = answers.capture.split(",").map((p: string) => p.trim());
      for (const pair of pairs) {
        const [k, v] = pair.split(":").map((s: string) => s.trim());
        if (k && v) {
          code += `\n        - ${k}: '${v}'`;
        }
      }
    }

    if (answers.hasCheck && answers.check) {
      code += "\n        Check";
      const conditions = answers.check.split(",").map((c: string) => c.trim());
      for (const cond of conditions) {
        if (cond) {
          code += `\n        - ${cond}`;
        }
      }
    }

    return code;
  }
  return "";
}
