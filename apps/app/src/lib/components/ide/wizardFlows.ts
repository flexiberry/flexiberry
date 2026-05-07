import { FormatUtil } from "@flexiberry/berrycore";

export type WizardPromptType = 'text' | 'select' | 'confirm';

export interface WizardStep {
  id: string;
  type: WizardPromptType;
  message: string;
  placeholder?: string;
  options?: { value: string; label: string }[];
  defaultValue?: string;
  condition?: (answers: Record<string, any>) => boolean;
}

export const apiFlow: WizardStep[] = [
  { id: 'name', type: 'text', message: 'What is the name of this API?', placeholder: 'Api Name' },
  { id: 'url', type: 'text', message: 'Please enter the API URL', placeholder: 'https://api.example.com' },
  {
    id: 'method',
    type: 'select',
    message: 'Choose the HTTP method',
    options: [
      { value: 'GET', label: 'GET — Retrieve data' },
      { value: 'POST', label: 'POST — Create a resource' },
      { value: 'PUT', label: 'PUT — Replace a resource' },
      { value: 'PATCH', label: 'PATCH — Partially update a resource' },
      { value: 'DELETE', label: 'DELETE — Remove a resource' }
    ]
  },
  { id: 'hasHeaders', type: 'confirm', message: 'Do you want to add request headers?' },
  {
    id: 'headers',
    type: 'text',
    message: 'Enter headers as comma-separated key:value pairs',
    placeholder: 'Content-Type:application/json , Authorization:Bearer token',
    condition: (ans) => ans.hasHeaders
  },
  { id: 'hasBody', type: 'confirm', message: 'Does this API have a request body?' },
  {
    id: 'bodyType',
    type: 'select',
    message: 'Choose the body content type',
    condition: (ans) => ans.hasBody,
    options: [
      { value: 'JSON', label: 'JSON' },
      { value: 'XML', label: 'XML' },
      { value: 'TEXT', label: 'Plain Text' },
      { value: 'GRAPHQL', label: 'GraphQL' },
      { value: 'OTHER', label: 'Other' }
    ]
  },
  {
    id: 'body',
    type: 'text',
    message: 'Enter the request body payload',
    placeholder: '{ "key": "value" }',
    condition: (ans) => ans.hasBody
  }
];

export const varFlow: WizardStep[] = [
  { id: 'title', type: 'text', message: 'Enter a title for this variable block', placeholder: 'myVar' },
  { id: 'env', type: 'text', message: 'Enter the environment pointer this variable block belongs to (optional)', placeholder: '' },
  { id: 'variables', type: 'text', message: 'Enter variables as comma-separated key:value pairs', placeholder: 'baseUrl:https://api.example.com , timeout:5000' }
];

export const envFlow: WizardStep[] = [
  { id: 'environments', type: 'text', message: 'Please enter environment names (comma-separated)', placeholder: 'SIT, UAT, PROD' }
];

export const taskFlow: WizardStep[] = [
  { id: 'name', type: 'text', message: 'What is the task name?', placeholder: '#myTask' },
  { id: 'statement', type: 'text', message: 'What should this task do? (e.g. Show "Hello")', placeholder: 'Show "Task executed"' }
];

export function buildCodeFromAnswers(type: 'Api' | 'Var' | 'Task' | 'Env' | 'Step', answers: Record<string, any>): string {
  if (type === 'Api') {
    let payload = answers.body || "";
    if (answers.bodyType === 'JSON') {
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
      bodyType: answers.bodyType || undefined
    });
  } else if (type === 'Var') {
    const title = answers.title || 'myVar';
    const env = answers.env || undefined;
    const variables = answers.variables ? answers.variables.split(',').map((v: string) => v.trim()) : [];
    return FormatUtil.buildVar(title, variables, env);
  } else if (type === 'Env') {
    const environments = answers.environments ? answers.environments.split(',').map((e: string) => e.trim()) : [];
    return FormatUtil.buildEnv(environments);
  } else if (type === 'Task') {
    const name = answers.name || '#myTask';
    const stmt = answers.statement || 'Show "Task executed"';
    return `Task ${name}\n  ${stmt}`;
  }
  return '';
}
