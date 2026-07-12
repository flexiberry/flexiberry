# Functional Requirement Document (FRD): Flexiberry Flow Editor UI

## 1. Overview

The goal is to build a modern, node-based visual editor and IDE interface for the **Flexiberry (.berry)** scripting language. It will combine a visual node-graph canvas with a real-time, auto-completing code editor, allowing bidirectional synchronization between visual editing and coding. The aesthetic will follow a professional, sleek dark theme (as provided in the reference image).

## 2. Global Layout Structure

The application adopts a modular workspace layout:

- **Top Header**: Project name, navigation breadcrumbs, Invite Users, Settings, Run/Play actions, and User Profile.
- **Center Canvas (Node Graph)**: Infinite canvas for visual flow building and visualization of connections.
- **Bottom-Left Panel (Code Editor)**: Code editing area with syntax highlighting for raw `.berry` scripts.
- **Right Sidebar (Explorer & Inspector)**: Quick-reference library, asset tracking, and variable scope inspector.
- **Bottom/Floating Context menus**: Pop-up menus and debug/running logs visible upon code execution.

## 3. Core Features

### 3.1 Authentication

- **Provider**: Firebase Authentication.
- **Available Methods**: Email and Password auth only (Login and Sign-up).

### 3.2 Code Editor (Bottom-Left Panel)

- **Functionality**: Dedicated pane for displaying and writing `.berry` code.
- **Auto-Complete Capability**: Leverages the AST and lexer from `berrycore` to provide intelligent autocomplete suggestions (e.g., suggesting declared variables inside URLs like `{{variable}}`, suggesting API names).
- **Node Creation Overlay Toolbar**: Features dedicated buttons situated at the top of the code section:
  - Add `Api` Node Button.
  - Add `Var` Node Button.
  - Add `Task` Node Button.

### 3.3 The Node Canvas Engine

The visual canvas maps directly to the `.berry` architecture.

#### 3.3.1 Universal Node Interactions

- **Hover/Click Detail**: Clicking or hovering over a node opens a fully detailed view or expanded properties form.
- **Contextual Right-Click actions**: Right-clicking on the canvas allows you to Add nodes. Right-clicking a node provides options like "Copy link", "Custom code", "Manage", "Hide", or "Remove".

#### 3.3.2 Node Types & Data Models

**A. API Node (`ApiBlockNode`)**

- **Visual Representation**: A distinct structural block defining an HTTP network request.
- **Hover/Click Behavior**: Displays complete HTTP interaction scope: Method (GET, POST), Identifier (`#identifier`), URL, and Headers.
- **Expandable Creation/Edit View**:
  - **Smart Imports**: Users can import API configuration via **cURL, Postman collection, or AI Assist**.
  - **URL Builder**: Input field for the URL endpoint.
  - **Method Selector**: Dropdown to choose the HTTP method.
  - **Header Configuration**: Multi-add UI rows for key-value pair headers (e.g., `Content-Type: application/json`).
  - **Request Body & Parameters**: Tabbed interface for adding JSON bodies or form parameters.

**B. Variable Node (`VarBlockNode`)**

- **Visual Representation**: Global/State storage container.
- **Hover/Click Behavior**: Displays its Title/Identifier and optional `@` pointer prefix.
- **Expandable Creation/Edit View**:
  - UI structed as per the `.berry` Var code structure.
  - Dynamic fields to add new key-value parameters. Supports visual toggles for strings vs. multiline variables.

**C. Task Node (`TaskBlockNode`)**

- **Visual Representation**: The root node for an execution sequence. Groups multiple Steps inside or chained to it.
- **Configuration**: Set Task Name and Description.

**D. Step Node (`StepBlockNode`) & Check Node (`ConditionNode`)**

- **Step Node**: Appears sequentially under a Task. Represents an action (e.g., `Call Api getUserProfile`).
  - **Expandable View**:
    - **Params**: UI to override API inputs dynamically.
    - **Capture**: Key-value pairs matching JSON dot-notation responses to localized variables (e.g., `authToken: response.body.token`).
- **Check (Assertion) Node**:
  - Visualizes assertion rules chained to a step (`status == 200 OR status == 201`).
  - UI builder to construct `Left-Hand Side, Operator, Right-Hand Side` logic.

### 3.4 Right Side Panel: Quick Reference

- **Universal Search**: Search bar to filter nodes and objects (`Items search`).
- **Expandable Accordion Categories**:
  - **APIs**: A searchable index of all defined API templates. Clicking/expanding them shows abstracted details (Base URL, defined method).
  - **Variables**: An index of `Var` items, showing their keys and real-time tracked scope.
  - **Operations / Transforms**: Standardized action primitives (e.g., Filter, Merge, Group) as suggested by the reference UI context.

## 4. Interaction Synchronization (Bidirectional)

- **Code-to-Node**: Typing within the bottom-left text editor parses the syntax in real-time to generate, position, and connect nodes on the visual canvas.
- **Node-to-Code**: Creating, dragging, or configuring nodes via the visual forms automatically writes and formats the underlying `.berry` code in the editor section point-in-time.
