# Documentation for the Custom Scripting Language

## Overview

This scripting language is designed for defining environments, variables, API calls, and tasks in a structured format. It allows users to specify configurations for different environments (like UAT, SIT) and perform API testing with clear steps and checks.

## Components

### 1. Environment Declaration

- **Syntax**: `Env <environment_name>`
- **Description**: Defines the environment in which the script will run. Multiple environments can be declared, such as UAT, SIT, and TAS.

### 2. Variable Declaration

- **Syntax**:
  ```
  Var <variable_name>
  - <key>: <value>
  ```
- **Description**: Declares variables that can be used throughout the script. Variables can hold simple values or complex structures.

### 3. API Call Definition

- **Syntax**:
  ```
  Api <method> #<name> <description>
  Url '<url>'
  Body <format>
  `<json>`
  Header
  - <key>: '<value>'
  ```
- **Description**: Defines an API call with its method (e.g., POST), a name for reference, a description, the URL, the body in JSON format, and any necessary headers.

### 4. Task Definition

- **Syntax**:
  ```
  Task <task_name>
  ```
- **Description**: Defines a task that groups a series of steps to be executed.

### 5. Step Definition

- **Syntax**:
  ```
  Step <step_name>
  ```
- **Description**: Defines a step within a task. Each step can include API calls, parameter definitions, and checks.

### 6. Parameter Declaration

- **Syntax**:
  ```
  Params
  - <key>: <value>
  ```
- **Description**: Declares parameters that can be passed to API calls or used within steps.

### 7. Capture Statement

- **Syntax**:
  ```
  Capture
  - <key>: "<value>"
  ```
- **Description**: Captures values from the response of an API call, such as tokens or status codes.

### 8. Check Statement

- **Syntax**:
  ```
  Check
  - <condition>
  ```
- **Description**: Defines conditions that must be met for the script to proceed. Conditions can include status checks and value comparisons.

### 9. Jump and Break Statements

- **Syntax**:
  ```
  Jump To @<step_number> If <condition> is True
  Break if <condition> is true
  ```
- **Description**: Control flow statements that allow the script to jump to a specific step or break out of a loop based on conditions.

## Example Breakdown

Here’s a brief breakdown of the provided code:

- **Environment Declaration**: The script starts by declaring environments (UAT, SIT, TAS).
- **Variable Declarations**: Variables for user ID and age are defined for use in API calls.
- **API Calls**: Two API calls are defined to interact with a user information service, including capturing tokens and checking responses.
- **Task and Steps**: A task is defined to test the application, with multiple steps that include calling APIs, capturing responses, and performing checks.

## Conclusion

This scripting language provides a clear and structured way to define environments, variables, and API interactions, making it suitable for testing and automation tasks. The use of simple syntax allows for easy readability and maintenance of scripts.
