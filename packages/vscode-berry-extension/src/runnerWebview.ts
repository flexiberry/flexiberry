import * as vscode from "vscode";

/**
 * Returns the HTML content for the Berry Execution Runner Webview.
 * Built with CSS Grid, VS Code theme CSS variables, a responsive layout, and micro-animations.
 */
export function getWebviewContent(fileName: string, logoUrl?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Berry Execution: ${fileName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=Fira+Code:wght@400;500&display=swap');

    :root {
      /* VS Code Theme Integration */
      --bg-color: var(--vscode-editor-background, #0f121a);
      --panel-bg: var(--vscode-sideBar-background, var(--vscode-editor-background, #161b26));
      --card-bg: var(--vscode-list-hoverBackground, rgba(255, 255, 255, 0.04));
      --hover-bg: var(--vscode-list-activeSelectionBackground, rgba(255, 255, 255, 0.08));
      --border-color: var(--vscode-panel-border, rgba(255, 255, 255, 0.08));
      --text-color: var(--vscode-editor-foreground, #f0f0f5);
      --text-muted: var(--vscode-descriptionForeground, #96a0b4);
      
      --accent-purple: var(--vscode-button-background, #6c5ce7);
      --accent-purple-glow: rgba(108, 92, 231, 0.3);
      --accent-green: #20bf6b;
      --accent-green-glow: rgba(32, 191, 107, 0.25);
      --accent-red: var(--vscode-errorForeground, #eb3b5a);
      --accent-red-glow: rgba(235, 59, 90, 0.2);
      --accent-blue: var(--vscode-textLink-activeForeground, #0984e3);
      --accent-yellow: var(--vscode-editorWarning-foreground, #fd9644);
      
      --font-sans: 'Outfit', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --font-mono: var(--vscode-editor-font-family, 'Fira Code', 'Courier New', Courier, monospace);
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: var(--font-sans);
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    /* ─── Header ───────────────────────────────────────────────────────────── */
    header {
      background-color: var(--panel-bg);
      border-bottom: 1px solid var(--border-color);
      padding: 16px 24px;
      display: flex;
      justify-content: justify;
      align-items: center;
      flex-shrink: 0;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-shrink: 0;
    }

    .logo-badge {
      background: linear-gradient(135deg, var(--accent-purple), #a88beb);
      color: white;
      font-weight: 700;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 14px;
      letter-spacing: 1px;
      box-shadow: 0 4px 12px var(--accent-purple-glow);
    }

    .header-logo {
      width: 28px;
      height: 28px;
      border-radius: 6px;
      object-fit: contain;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    }

    h1 {
      font-size: 18px;
      font-weight: 600;
      color: var(--text-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 200px;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: auto;
      flex-wrap: wrap;
    }

    /* Green Run Button */
    .run-btn {
      background-color: var(--accent-green);
      color: white;
      border: none;
      padding: 8px 16px;
      font-family: var(--font-sans);
      font-weight: 600;
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
      box-shadow: 0 4px 10px var(--accent-green-glow);
      flex-shrink: 0;
    }

    .run-btn:hover {
      background-color: #26d07c;
      transform: translateY(-1px);
      box-shadow: 0 6px 14px rgba(32, 191, 107, 0.4);
    }

    .run-btn:active {
      transform: translateY(0);
    }

    .run-btn.disabled {
      background-color: var(--border-color) !important;
      color: var(--text-muted) !important;
      cursor: not-allowed;
      box-shadow: none !important;
      transform: none !important;
    }

    .status-badge {
      font-weight: 600;
      font-size: 11px;
      text-transform: uppercase;
      padding: 5px 12px;
      border-radius: 20px;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 6px;
      border: 1px solid transparent;
      flex-shrink: 0;
    }

    .status-badge.idle {
      background-color: rgba(255, 255, 255, 0.05);
      color: var(--text-muted);
      border-color: var(--border-color);
    }

    .status-badge.running {
      background-color: rgba(108, 92, 231, 0.15);
      color: #a88beb;
      border-color: var(--accent-purple);
      animation: pulse 1.5s infinite alternate;
    }

    .status-badge.success {
      background-color: rgba(32, 191, 107, 0.15);
      color: var(--accent-green);
      border-color: var(--accent-green);
    }

    .status-badge.failed {
      background-color: rgba(235, 59, 90, 0.15);
      color: var(--accent-red);
      border-color: var(--accent-red);
    }

    .header-stats {
      font-size: 13px;
      color: var(--text-muted);
      display: flex;
      gap: 16px;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
    }

    .stat-val {
      font-weight: 600;
      color: var(--text-color);
    }

    .stat-lbl {
      font-size: 9px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* ─── Main Content Layout ────────────────────────────────────────────── */
    main {
      display: flex;
      flex: 1;
      overflow: hidden;
      position: relative;
    }

    /* ─── Left Sidebar (Tasks & Steps) ────────────────────────────────────── */
    .sidebar {
      width: 100%; /* Full width when no selection */
      background-color: var(--panel-bg);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      overflow-y: auto;
      transition: width 0.2s ease-in-out;
    }

    main.has-selection .sidebar {
      width: 300px; /* Shrink to sidebar width */
      border-right: 1px solid var(--border-color);
    }

    .sidebar-title {
      padding: 16px 20px 8px 20px;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: var(--text-muted);
      font-weight: 700;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }

    .iteration-selector {
      background-color: var(--bg-color);
      color: var(--text-color);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 11px;
      font-family: var(--font-sans);
      cursor: pointer;
      outline: none;
    }

    .tasks-list {
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .task-card {
      background-color: rgba(255, 255, 255, 0.01);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
      transition: all 0.2s ease;
    }

    .task-card.active {
      border-color: rgba(108, 92, 231, 0.4);
      box-shadow: 0 0 8px rgba(108, 92, 231, 0.1);
    }

    .task-header {
      padding: 12px 14px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.01);
      border-bottom: 1px solid var(--border-color);
    }

    .task-title-area {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .task-steps {
      display: flex;
      flex-direction: column;
    }

    .step-item {
      padding: 10px 14px 10px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      font-size: 13px;
      transition: all 0.15s ease;
      position: relative;
    }

    .step-item::before {
      content: '';
      position: absolute;
      left: 14px;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 4px;
      border-radius: 50%;
      background-color: var(--text-muted);
      opacity: 0.5;
    }

    .step-item:hover {
      background-color: var(--hover-bg);
    }

    .step-item.selected {
      background-color: var(--hover-bg);
      color: var(--text-color);
      font-weight: 500;
    }

    .step-item.selected::before {
      background-color: var(--accent-purple);
      opacity: 1;
      width: 6px;
      height: 6px;
    }

    .step-name-area {
      display: flex;
      align-items: center;
      gap: 8px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      flex: 1;
    }

    .step-meta {
      font-size: 11px;
      color: var(--text-muted);
      margin-left: 8px;
      white-space: nowrap;
    }

    /* Status icons */
    .icon-spin {
      animation: spin 1s linear infinite;
      display: inline-block;
      width: 12px;
      height: 12px;
      border: 2px solid var(--text-muted);
      border-top-color: transparent;
      border-radius: 50%;
    }
    
    .icon-status {
      font-weight: bold;
      font-size: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-pass { color: var(--accent-green); }
    .icon-fail { color: var(--accent-red); }
    .icon-skip { color: var(--text-muted); opacity: 0.5; }

    /* ─── Right Pane (Step Details / Inspector) ───────────────────────────── */
    .inspector {
      flex: 1;
      background-color: var(--bg-color);
      display: none; /* Hidden by default when no selection */
      flex-direction: column;
      overflow-y: auto;
      padding: 24px;
    }

    main.has-selection .inspector {
      display: flex; /* Show when selection exists */
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      flex: 1;
      color: var(--text-muted);
      text-align: center;
      gap: 16px;
    }

    .empty-state svg {
      width: 64px;
      height: 64px;
      color: var(--border-color);
    }

    .inspector-header {
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 16px;
    }

    .inspector-title-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
      margin-bottom: 8px;
    }

    .inspector-title {
      font-size: 20px;
      font-weight: 700;
    }

    .inspector-subtitle {
      font-family: var(--font-mono);
      font-size: 12px;
      color: var(--text-muted);
      word-break: break-all;
      margin-top: 4px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .method-badge {
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 10px;
      padding: 2px 5px;
      border-radius: 4px;
      color: white;
    }

    .method-badge.GET { background-color: var(--accent-blue); }
    .method-badge.POST { background-color: var(--accent-green); }
    .method-badge.PUT { background-color: var(--accent-yellow); }
    .method-badge.DELETE { background-color: var(--accent-red); }
    .method-badge.PATCH { background-color: #8e44ad; }

    .inspector-metrics {
      display: flex;
      gap: 16px;
      margin-top: 16px;
      flex-wrap: wrap;
    }

    .metric-box {
      background-color: var(--panel-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 14px;
      min-width: 90px;
    }

    .metric-value {
      font-size: 15px;
      font-weight: 600;
      margin-top: 2px;
    }

    .metric-label {
      font-size: 9px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    /* Tabs */
    .tabs-header {
      display: flex;
      border-bottom: 1px solid var(--border-color);
      gap: 8px;
      margin-bottom: 16px;
      overflow-x: auto;
      white-space: nowrap;
      scrollbar-width: none;
    }

    .tabs-header::-webkit-scrollbar {
      display: none;
    }

    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      padding: 10px 16px;
      cursor: pointer;
      font-family: var(--font-sans);
      font-size: 13px;
      font-weight: 500;
      border-bottom: 2px solid transparent;
      transition: all 0.2s ease;
      outline: none;
      flex-shrink: 0;
    }

    .tab-btn:hover {
      color: var(--text-color);
      background-color: rgba(255, 255, 255, 0.02);
    }

    .tab-btn.active {
      color: var(--accent-purple);
      border-bottom-color: var(--accent-purple);
      font-weight: 600;
    }

    .tab-content {
      flex: 1;
      display: none;
      overflow-y: auto;
    }

    .tab-content.active {
      display: block;
    }

    /* Content components */
    pre.code-block {
      background-color: var(--panel-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 16px;
      font-family: var(--font-mono);
      font-size: 12px;
      overflow-x: auto;
      line-height: 1.5;
      color: var(--text-color);
      max-height: 400px;
      word-break: break-all;
      white-space: pre-wrap;
    }

    .header-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 12px;
      font-family: var(--font-mono);
      background-color: var(--panel-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      overflow: hidden;
    }

    .header-table th, .header-table td {
      padding: 10px 16px;
      text-align: left;
      border-bottom: 1px solid var(--border-color);
      word-break: break-all;
    }

    .header-table th {
      background-color: rgba(255, 255, 255, 0.02);
      color: var(--text-muted);
      font-weight: 600;
      font-family: var(--font-sans);
    }

    .header-table tr:last-child td {
      border-bottom: none;
    }

    .capture-list, .check-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .capture-item, .check-item {
      background-color: var(--panel-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 13px;
      flex-wrap: wrap;
      gap: 8px;
    }

    .capture-key {
      font-family: var(--font-mono);
      font-weight: 600;
      color: var(--accent-purple);
    }

    .capture-val {
      font-family: var(--font-mono);
      background-color: rgba(255, 255, 255, 0.04);
      padding: 4px 8px;
      border-radius: 4px;
      max-width: 100%;
      word-break: break-all;
    }

    .check-exp {
      font-family: var(--font-mono);
      font-weight: 500;
      word-break: break-all;
    }

    .check-status {
      font-weight: 600;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 11px;
    }

    .check-status.pass {
      background-color: rgba(32, 191, 107, 0.15);
      color: var(--accent-green);
    }

    .check-status.fail {
      background-color: rgba(235, 59, 90, 0.15);
      color: var(--accent-red);
    }

    .error-banner {
      background-color: rgba(235, 59, 90, 0.08);
      border: 1px solid var(--accent-red);
      border-radius: 8px;
      padding: 14px 18px;
      color: #ff8a9e;
      margin-bottom: 20px;
      font-size: 13px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .error-banner-title {
      font-weight: 700;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .error-banner-desc {
      font-family: var(--font-mono);
      font-size: 12px;
      white-space: pre-wrap;
      word-break: break-all;
    }

    /* ─── Expandable Bottom Panel (Logs Console) ────────────────────────── */
    .console-panel {
      height: 150px;
      background-color: var(--panel-bg);
      border-top: 1px solid var(--border-color);
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
    }

    .console-header {
      padding: 8px 20px;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: rgba(255, 255, 255, 0.01);
    }

    .console-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .console-controls {
      display: flex;
      align-items: center;
      gap: 16px;
      font-size: 10px;
      color: var(--text-muted);
    }

    .console-controls label {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: pointer;
    }

    .clear-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-family: var(--font-sans);
      font-size: 10px;
    }

    .clear-btn:hover {
      color: var(--text-color);
    }

    .console-rows {
      flex: 1;
      padding: 10px 20px;
      overflow-y: auto;
      font-family: var(--font-mono);
      font-size: 11px;
      line-height: 1.6;
      display: flex;
      flex-direction: column;
      gap: 4px;
      background-color: var(--bg-color);
    }

    .console-row {
      word-break: break-all;
    }

    .console-row.info { color: var(--text-color); }
    .console-row.warn { color: var(--accent-yellow); }
    .console-row.error { color: var(--accent-red); }
    .console-row.system { color: var(--accent-purple); font-weight: 500; }

    /* Standalone Mode adjustments */
    main.is-standalone .sidebar {
      display: none !important;
    }
    
    main.is-standalone .inspector {
      display: flex !important;
      width: 100% !important;
      flex: 1 !important;
    }

    /* ─── Responsive Media Queries ────────────────────────────────────────── */
    @media (max-width: 768px) {
      header {
        padding: 12px 16px;
      }
      
      .header-right {
        width: 100%;
        margin-left: 0;
        justify-content: space-between;
        margin-top: 8px;
      }
      
      main {
        flex-direction: column;
      }

      .sidebar {
        width: 100% !important;
        height: 100%; /* Full height when no selection */
        border-right: none;
        border-bottom: none;
        transition: height 0.2s ease-in-out;
      }

      main.has-selection .sidebar {
        height: 200px; /* Shrink height to make room for inspector */
        border-bottom: 1px solid var(--border-color);
      }

      .inspector {
        flex: 1;
        padding: 16px;
      }
      
      .inspector-title {
        font-size: 18px;
      }
      
      .console-panel {
        height: 120px;
      }
    }

    @media (max-width: 480px) {
      header {
        flex-direction: column;
        align-items: flex-start;
        gap: 12px;
      }
      
      .header-right {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        width: 100%;
      }
      
      .header-stats {
        justify-content: space-between;
        width: 100%;
      }
      
      .run-btn {
        width: 100%;
        justify-content: center;
      }
      
      .status-badge {
        align-self: flex-start;
      }
    }

    /* ─── Animations ───────────────────────────────────────────────────────── */
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    @keyframes pulse {
      0% { box-shadow: 0 0 4px var(--accent-purple-glow); }
      100% { box-shadow: 0 0 10px var(--accent-purple); }
    }
  </style>
</head>
<body>

  <!-- Header -->
  <header>
    <div class="header-left">
      ${logoUrl ? `<img src="${logoUrl}" alt="FlexiBerry Logo" class="header-logo" />` : ''}
      <div>
        <h1 id="file-title" title="${fileName}">${fileName}</h1>
      </div>
    </div>
    <div class="header-right">
      <button class="run-btn" id="run-button" onclick="triggerRun()">
        <span id="run-button-icon">▶</span> <span id="run-button-text">Run</span>
      </button>
      <div class="header-stats">
        <div class="stat-item" id="stat-iter-container" style="display:none;">
          <span class="stat-val" id="stat-iter">1/1</span>
          <span class="stat-lbl">Iteration</span>
        </div>
        <div class="stat-item">
          <span class="stat-val" id="stat-tasks">0</span>
          <span class="stat-lbl">Tasks</span>
        </div>
        <div class="stat-item">
          <span class="stat-val text-pass" id="stat-passed" style="color:var(--accent-green);">0</span>
          <span class="stat-lbl">Passed</span>
        </div>
        <div class="stat-item">
          <span class="stat-val text-fail" id="stat-failed" style="color:var(--accent-red);">0</span>
          <span class="stat-lbl">Failed</span>
        </div>
        <div class="stat-item">
          <span class="stat-val" id="stat-duration">0ms</span>
          <span class="stat-lbl">Duration</span>
        </div>
      </div>
      <div class="status-badge idle" id="execution-status-badge">
        <span id="status-icon">•</span>
        <span id="status-text">Idle</span>
      </div>
    </div>
  </header>

  <!-- Main View -->
  <main id="main-container">
    <!-- Left Sidebar: Tasks and Steps -->
    <div class="sidebar">
      <div class="sidebar-title">
        <span>Execution Plan</span>
        <select class="iteration-selector" id="iter-dropdown" style="display:none;" onchange="changeIteration(this.value)">
          <option value="0">Iteration 1</option>
        </select>
      </div>
      <div class="tasks-list" id="plan-tasks-container">
        <!-- Rendered dynamically -->
        <div class="empty-state" style="padding: 20px;">
          <span>No plan loaded yet.</span>
        </div>
      </div>
    </div>

    <!-- Right Inspector: Detailed Step Info -->
    <div class="inspector" id="step-inspector">
      <div class="empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
        <h3>No Step Selected</h3>
        <p>Select a step from the execution plan sidebar to view response details, captured variables, and check assertions.</p>
      </div>
    </div>
  </main>

  <!-- Expandable Console Log -->
  <div class="console-panel">
    <div class="console-header">
      <div class="console-title">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="4 17 10 11 4 5"></polyline>
          <line x1="12" y1="19" x2="20" y2="19"></line>
        </svg>
        <span>Console Output</span>
      </div>
      <div class="console-controls">
        <label>
          <input type="checkbox" id="autoscroll-chk" checked> Auto-scroll
        </label>
        <button class="clear-btn" onclick="clearLogs()">Clear</button>
      </div>
    </div>
    <div class="console-rows" id="console-rows-container">
      <!-- Logs streaming -->
    </div>
  </div>

  <script>
    // State management
    let state = {
      status: 'idle',
      totalTasks: 0,
      passedTasks: 0,
      failedTasks: 0,
      startTime: null,
      durationMs: 0,
      
      iterations: [],
      currentIterationIndex: 0,
      
      selectedStepAddress: null, // { iterIdx, taskIdx, stepIdx }
      
      globalErrors: []
    };

    let timerInterval = null;

    // Connect to VS Code API
    const vscode = acquireVsCodeApi();

    // Listen to messages from VS Code extension
    window.addEventListener('message', event => {
      const message = event.data;
      
      switch (message.type) {
        case 'start':
          resetState();
          updateStatus('running');
          setRunButtonState(true);
          logSystem('Starting execution of ' + message.fileName + '...');
          state.startTime = new Date();
          startTimer();
          break;
          
        case 'startStandalone':
          resetState();
          state.isStandalone = true;
          state.standaloneApiName = message.apiName;
          state.standaloneData = null;
          
          document.getElementById('file-title').innerText = message.apiName + ' (Standalone)';
          document.getElementById('main-container').classList.add('is-standalone');
          document.getElementById('main-container').classList.add('has-selection');
          
          updateStatus('running');
          setRunButtonState(true);
          logSystem('Starting standalone execution of API #' + message.apiName + '...');
          state.startTime = new Date();
          startTimer();
          
          inspectStandalone();
          break;
          
        case 'apiStandaloneDone':
          state.standaloneData = {
            request: message.request,
            response: message.response,
            duration: message.duration
          };
          inspectStandalone();
          break;
          
        case 'plan':
          initializePlan(message.plan);
          break;
          
        case 'iteration':
          const iterIndex = message.index;
          state.currentIterationIndex = iterIndex;
          logSystem('--- Iteration ' + (iterIndex + 1) + ' ---');
          ensureIterationExists(iterIndex);
          updateIterationUI();
          break;
          
        case 'taskBegin':
          updateTaskStatus(state.currentIterationIndex, message.index, 'RUNNING');
          break;
          
        case 'taskDone':
          updateTaskStatus(state.currentIterationIndex, message.index, message.status);
          break;
          
        case 'stepBegin':
          updateStepStatus(state.currentIterationIndex, message.taskIndex, message.index, 'RUNNING');
          break;
          
        case 'apiCallBegin':
          updateStepApiDetails(state.currentIterationIndex, message.taskIndex, message.index, message.method, message.url);
          break;
          
        case 'apiCallDone':
          updateStepApiCompletion(state.currentIterationIndex, message.taskIndex, message.index, message.status, message.duration);
          break;
          
        case 'stepDone':
          updateStepCompletion(state.currentIterationIndex, message.taskIndex, message.index, message.status, message.payload);
          break;
          
        case 'log':
          appendLog(message.level, message.message);
          break;
          
        case 'error':
          handleGlobalError(message.error);
          break;
          
        case 'completed':
          updateStatus(message.success ? 'success' : 'failed');
          setRunButtonState(false);
          stopTimer();
          if (message.duration) {
            state.durationMs = message.duration;
            document.getElementById('stat-duration').innerText = message.duration + 'ms';
          }
          logSystem('Execution completed in ' + document.getElementById('stat-duration').innerText);
          break;
      }
    });

    function triggerRun() {
      if (state.isStandalone) {
        vscode.postMessage({ type: 'runStandalone', apiName: state.standaloneApiName });
      } else {
        vscode.postMessage({ type: 'run' });
      }
    }

    function setRunButtonState(isRunning) {
      const btn = document.getElementById('run-button');
      const btnIcon = document.getElementById('run-button-icon');
      const btnText = document.getElementById('run-button-text');
      
      if (isRunning) {
        btn.classList.add('disabled');
        btn.disabled = true;
        btnIcon.className = 'icon-spin';
        btnIcon.innerText = '';
        btnText.innerText = 'Running';
      } else {
        btn.classList.remove('disabled');
        btn.disabled = false;
        btnIcon.className = '';
        btnIcon.innerText = '▶';
        btnText.innerText = 'Run';
      }
    }

    function resetState() {
      state.status = 'idle';
      state.totalTasks = 0;
      state.passedTasks = 0;
      state.failedTasks = 0;
      state.startTime = null;
      state.durationMs = 0;
      state.iterations = [];
      state.currentIterationIndex = 0;
      state.selectedStepAddress = null;
      state.globalErrors = [];
      
      state.isStandalone = false;
      state.standaloneApiName = null;
      state.standaloneData = null;
      
      document.getElementById('main-container').classList.remove('is-standalone');
      document.getElementById('main-container').classList.remove('has-selection');
      
      document.getElementById('stat-tasks').innerText = '0';
      document.getElementById('stat-passed').innerText = '0';
      document.getElementById('stat-failed').innerText = '0';
      document.getElementById('stat-duration').innerText = '0ms';
      
      document.getElementById('console-rows-container').innerHTML = '';
      document.getElementById('iter-dropdown').style.display = 'none';
      document.getElementById('stat-iter-container').style.display = 'none';
      
      if (timerInterval) clearInterval(timerInterval);
    }

    function startTimer() {
      if (timerInterval) clearInterval(timerInterval);
      timerInterval = setInterval(() => {
        if (!state.startTime) return;
        const diff = new Date() - state.startTime;
        document.getElementById('stat-duration').innerText = diff + 'ms';
      }, 100);
    }

    function stopTimer() {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
      }
    }

    function updateStatus(status) {
      state.status = status;
      const badge = document.getElementById('execution-status-badge');
      const icon = document.getElementById('status-icon');
      const text = document.getElementById('status-text');
      
      badge.className = 'status-badge ' + status;
      text.innerText = status;
      
      if (status === 'running') {
        icon.className = 'icon-spin';
        icon.innerText = '';
      } else {
        icon.className = 'icon-status';
        if (status === 'success') {
          icon.innerText = '✔';
          icon.style.color = 'var(--accent-green)';
        } else if (status === 'failed') {
          icon.innerText = '❌';
          icon.style.color = 'var(--accent-red)';
        } else {
          icon.innerText = '•';
          icon.style.color = 'var(--text-muted)';
        }
      }
    }

    function ensureIterationExists(iterIdx) {
      while (state.iterations.length <= iterIdx) {
        const templateTasks = state.iterations[0] 
          ? JSON.parse(JSON.stringify(state.iterations[0].tasks)) 
          : [];
        
        templateTasks.forEach(t => {
          t.status = 'PENDING';
          t.steps.forEach(s => {
            s.status = 'PENDING';
            s.duration = null;
            s.response = null;
            s.error = null;
            s.checks = null;
          });
        });

        state.iterations.push({ tasks: templateTasks });
      }
    }

    function initializePlan(plan) {
      const tasks = plan.map((task, taskIdx) => ({
        title: task.title || ('Task ' + (taskIdx + 1)),
        index: taskIdx,
        status: 'PENDING',
        steps: task.steps.map((step, stepIdx) => ({
          targetName: step.targetName,
          index: stepIdx,
          status: 'PENDING',
          method: null,
          url: null,
          response: null,
          checks: null,
          error: null,
          duration: null
        }))
      }));

      state.iterations = [{ tasks }];
      state.totalTasks = tasks.length;
      document.getElementById('stat-tasks').innerText = state.totalTasks;
      
      renderPlanSidebar();
    }

    function updateIterationUI() {
      const dropdown = document.getElementById('iter-dropdown');
      const statContainer = document.getElementById('stat-iter-container');
      const statIterVal = document.getElementById('stat-iter');

      if (state.iterations.length > 1) {
        dropdown.style.display = 'block';
        statContainer.style.display = 'flex';
        statIterVal.innerText = (state.currentIterationIndex + 1) + '/' + state.iterations.length;

        dropdown.innerHTML = '';
        state.iterations.forEach((_, idx) => {
          const opt = document.createElement('option');
          opt.value = idx;
          opt.innerText = 'Iteration ' + (idx + 1);
          opt.selected = (idx === state.currentIterationIndex);
          dropdown.appendChild(opt);
        });
      }

      renderPlanSidebar();
    }

    function changeIteration(val) {
      state.currentIterationIndex = parseInt(val, 10);
      updateIterationUI();
      if (state.selectedStepAddress) {
        state.selectedStepAddress.iterIdx = state.currentIterationIndex;
        inspectStep(state.selectedStepAddress.iterIdx, state.selectedStepAddress.taskIdx, state.selectedStepAddress.stepIdx);
      }
    }

    function updateTaskStatus(iterIdx, taskIdx, status) {
      ensureIterationExists(iterIdx);
      const iter = state.iterations[iterIdx];
      if (iter && iter.tasks[taskIdx]) {
        iter.tasks[taskIdx].status = status;
        
        if (iterIdx === state.currentIterationIndex) {
          recalculateStats();
          renderPlanSidebar();
        }
      }
    }

    function updateStepStatus(iterIdx, taskIndex, index, status) {
      ensureIterationExists(iterIdx);
      const iter = state.iterations[iterIdx];
      if (iter && iter.tasks[taskIndex] && iter.tasks[taskIndex].steps[index]) {
        iter.tasks[taskIndex].steps[index].status = status;
        if (iterIdx === state.currentIterationIndex) {
          renderPlanSidebar();
        }
      }
    }

    function updateStepApiDetails(iterIdx, taskIndex, index, method, url) {
      ensureIterationExists(iterIdx);
      const iter = state.iterations[iterIdx];
      if (iter && iter.tasks[taskIndex] && iter.tasks[taskIndex].steps[index]) {
        const step = iter.tasks[taskIndex].steps[index];
        step.method = method;
        step.url = url;
      }
    }

    function updateStepApiCompletion(iterIdx, taskIndex, index, status, duration) {
      ensureIterationExists(iterIdx);
      const iter = state.iterations[iterIdx];
      if (iter && iter.tasks[taskIndex] && iter.tasks[taskIndex].steps[index]) {
        const step = iter.tasks[taskIndex].steps[index];
        step.duration = duration;
      }
    }

    function updateStepCompletion(iterIdx, taskIndex, index, status, payload) {
      ensureIterationExists(iterIdx);
      const iter = state.iterations[iterIdx];
      if (iter && iter.tasks[taskIndex] && iter.tasks[taskIndex].steps[index]) {
        const step = iter.tasks[taskIndex].steps[index];
        step.status = status;
        step.error = payload.error;
        step.response = payload.response;
        
        if (payload.checksPassed !== null) {
          step.checks = [];
        }
        
        if (payload.response) {
          step.response = {
            status: payload.response.status,
            headers: payload.response.headers || {},
            body: payload.response.body
          };
        }

        if (payload.checks) {
          step.checks = payload.checks;
        } else if (payload.checksPassed !== null) {
          step.checks = [{
            expression: 'Step assertions',
            passed: payload.checksPassed
          }];
        }

        if (iterIdx === state.currentIterationIndex) {
          renderPlanSidebar();
          if (state.selectedStepAddress && 
              state.selectedStepAddress.iterIdx === iterIdx && 
              state.selectedStepAddress.taskIdx === taskIndex && 
              state.selectedStepAddress.stepIdx === index) {
            inspectStep(iterIdx, taskIndex, index);
          }
        }
      }
    }

    function recalculateStats() {
      const iter = state.iterations[state.currentIterationIndex];
      if (!iter) return;
      
      let passed = 0;
      let failed = 0;
      
      iter.tasks.forEach(t => {
        if (t.status === 'PASS') passed++;
        else if (t.status === 'FAILED') failed++;
      });
      
      state.passedTasks = passed;
      state.failedTasks = failed;
      
      document.getElementById('stat-passed').innerText = passed;
      document.getElementById('stat-failed').innerText = failed;
    }

    function renderPlanSidebar() {
      const container = document.getElementById('plan-tasks-container');
      const iter = state.iterations[state.currentIterationIndex];
      if (!iter || iter.tasks.length === 0) {
        container.innerHTML = '<div class="empty-state" style="padding: 20px;"><span>No plan loaded.</span></div>';
        return;
      }

      container.innerHTML = '';
      iter.tasks.forEach((task, taskIdx) => {
        const card = document.createElement('div');
        const isTaskActive = (task.status === 'RUNNING');
        card.className = 'task-card' + (isTaskActive ? ' active' : '');
        
        let statusIconHtml = '';
        if (task.status === 'RUNNING') {
          statusIconHtml = '<span class="icon-spin"></span>';
        } else if (task.status === 'PASS') {
          statusIconHtml = '<span class="icon-status icon-pass">✔</span>';
        } else if (task.status === 'FAILED') {
          statusIconHtml = '<span class="icon-status icon-fail">❌</span>';
        } else if (task.status === 'SKIPPED') {
          statusIconHtml = '<span class="icon-status icon-skip">🔲</span>';
        } else {
          statusIconHtml = '<span class="icon-status" style="color:var(--text-muted); opacity: 0.5;">•</span>';
        }

        const header = document.createElement('div');
        header.className = 'task-header';
        header.innerHTML = \`
          <div class="task-title-area">
            \${statusIconHtml}
            <span>\${task.title}</span>
          </div>
        \`;
        card.appendChild(header);

        const stepsList = document.createElement('div');
        stepsList.className = 'task-steps';
        
        task.steps.forEach((step, stepIdx) => {
          const item = document.createElement('div');
          const isSelected = state.selectedStepAddress && 
                             state.selectedStepAddress.iterIdx === state.currentIterationIndex && 
                             state.selectedStepAddress.taskIdx === taskIdx && 
                             state.selectedStepAddress.stepIdx === stepIdx;
          
          item.className = 'step-item' + (isSelected ? ' selected' : '');
          item.onclick = () => selectStep(state.currentIterationIndex, taskIdx, stepIdx);

          let stepIconHtml = '';
          if (step.status === 'RUNNING') {
            stepIconHtml = '<span class="icon-spin"></span>';
          } else if (step.status === 'PASS') {
            stepIconHtml = '<span class="icon-status icon-pass">✔</span>';
          } else if (step.status === 'FAILED') {
            stepIconHtml = '<span class="icon-status icon-fail">❌</span>';
          } else if (step.status === 'SKIPPED') {
            stepIconHtml = '<span class="icon-status icon-skip">🔲</span>';
          } else {
            stepIconHtml = '<span class="icon-status" style="color:var(--text-muted); opacity: 0.5;">•</span>';
          }

          const durationText = step.duration !== null ? (step.duration + 'ms') : '';

          item.innerHTML = \`
            <div class="step-name-area">
              \${stepIconHtml}
              <span>\${step.targetName}</span>
            </div>
            \${durationText ? \`<span class="step-meta">\${durationText}</span>\` : ''}
          \`;
          stepsList.appendChild(item);
        });

        card.appendChild(stepsList);
        container.appendChild(card);
      });
    }

    function selectStep(iterIdx, taskIdx, stepIdx) {
      state.selectedStepAddress = { iterIdx, taskIdx, stepIdx };
      document.getElementById('main-container').classList.add('has-selection');
      renderPlanSidebar();
      inspectStep(iterIdx, taskIdx, stepIdx);
    }

    function inspectStep(iterIdx, taskIdx, stepIdx) {
      const inspector = document.getElementById('step-inspector');
      const iter = state.iterations[iterIdx];
      if (!iter || !iter.tasks[taskIdx] || !iter.tasks[taskIdx].steps[stepIdx]) return;
      
      const step = iter.tasks[taskIdx].steps[stepIdx];
      
      let statusText = 'PENDING';
      let statusColor = 'var(--text-muted)';
      if (step.status === 'RUNNING') { statusText = 'RUNNING'; statusColor = 'var(--accent-purple)'; }
      else if (step.status === 'PASS') { statusText = 'PASSED'; statusColor = 'var(--accent-green)'; }
      else if (step.status === 'FAILED') { statusText = 'FAILED'; statusColor = 'var(--accent-red)'; }
      else if (step.status === 'SKIPPED') { statusText = 'SKIPPED'; statusColor = 'var(--text-muted)'; }

      let headerHtml = \`
        <div class="inspector-header">
          <div class="inspector-title-row">
            <h2 class="inspector-title">\${step.targetName}</h2>
            <span class="status-badge" style="background-color:rgba(255,255,255,0.02); color:\${statusColor}; border-color:\${statusColor};">\${statusText}</span>
          </div>
          \${step.url ? \`
            <div class="inspector-subtitle">
              <span class="method-badge \${step.method}">\${step.method}</span>
              <span>\${step.url}</span>
            </div>
          \` : ''}
          <div class="inspector-metrics">
            \${step.duration !== null ? \`
              <div class="metric-box">
                <div class="metric-value">\${step.duration}ms</div>
                <div class="metric-label">Duration</div>
              </div>
            \` : ''}
            \${step.response && step.response.status ? \`
              <div class="metric-box">
                <div class="metric-value" style="color:\${step.response.status >= 200 && step.response.status < 300 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                  \${step.response.status}
                </div>
                <div class="metric-label">HTTP Status</div>
              </div>
            \` : ''}
          </div>
        </div>
      \`;

      let activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'body';
      
      let tabsHeaderHtml = \`
        <div class="tabs-header">
          <button class="tab-btn \${activeTab === 'body' ? 'active' : ''}" data-tab="body" onclick="switchTab('body')">Response Body</button>
          <button class="tab-btn \${activeTab === 'headers' ? 'active' : ''}" data-tab="headers" onclick="switchTab('headers')">Headers</button>
          <button class="tab-btn \${activeTab === 'captures' ? 'active' : ''}" data-tab="captures" onclick="switchTab('captures')">Captures</button>
          <button class="tab-btn \${activeTab === 'checks' ? 'active' : ''}" data-tab="checks" onclick="switchTab('checks')">Assertions</button>
        </div>
      \`;

      let bodyContent = 'No response payload available.';
      if (step.response && step.response.body !== undefined && step.response.body !== null) {
        if (typeof step.response.body === 'object') {
          bodyContent = JSON.stringify(step.response.body, null, 2);
        } else {
          bodyContent = String(step.response.body);
        }
      }

      let headersHtml = '<div style="color:var(--text-muted); font-size: 13px;">No headers received.</div>';
      if (step.response && step.response.headers && Object.keys(step.response.headers).length > 0) {
        headersHtml = \`
          <table class="header-table">
            <thead>
              <tr><th>Header</th><th>Value</th></tr>
            </thead>
            <tbody>
              \${Object.entries(step.response.headers).map(([k, v]) => \`
                <tr><td>\${k}</td><td>\${v}</td></tr>
              \`).join('')}
            </tbody>
          </table>
        \`;
      }

      let capturesHtml = '<div style="color:var(--text-muted); font-size: 13px;">No variables captured.</div>';
      if (step.response && step.response.captures && Object.keys(step.response.captures).length > 0) {
        capturesHtml = \`
          <div class="capture-list">
            \${Object.entries(step.response.captures).map(([k, v]) => \`
              <div class="capture-item">
                <span class="capture-key">\${k}</span>
                <span class="capture-val">\${typeof v === 'object' ? JSON.stringify(v) : v}</span>
              </div>
            \`).join('')}
          </div>
        \`;
      }

      let checksHtml = '<div style="color:var(--text-muted); font-size: 13px;">No assertions specified.</div>';
      if (step.checks && step.checks.length > 0) {
        checksHtml = \`
          <div class="check-list">
            \${step.checks.map(c => \`
              <div class="check-item">
                <span class="check-exp">\${c.expression}</span>
                <span class="check-status \${c.passed ? 'pass' : 'fail'}">\${c.passed ? 'PASS' : 'FAIL'}</span>
              </div>
            \`).join('')}
          </div>
        \`;
      }

      let errorBannerHtml = '';
      if (step.error) {
        errorBannerHtml = \`
          <div class="error-banner">
            <div class="error-banner-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>Step Execution Failed</span>
            </div>
            <div class="error-banner-desc">\${step.error}</div>
          </div>
        \`;
      }

      let tabsContentHtml = \`
        <div class="tab-content \${activeTab === 'body' ? 'active' : ''}" id="tab-body">
          <pre class="code-block">\${escapeHtml(bodyContent)}</pre>
        </div>
        <div class="tab-content \${activeTab === 'headers' ? 'active' : ''}" id="tab-headers">
          \${headersHtml}
        </div>
        <div class="tab-content \${activeTab === 'captures' ? 'active' : ''}" id="tab-captures">
          \${capturesHtml}
        </div>
        <div class="tab-content \${activeTab === 'checks' ? 'active' : ''}" id="tab-checks">
          \${checksHtml}
        </div>
      \`;

      inspector.innerHTML = headerHtml + errorBannerHtml + tabsHeaderHtml + tabsContentHtml;
    }

    function inspectStandalone() {
      const inspector = document.getElementById('step-inspector');
      if (!state.standaloneData) {
        inspector.innerHTML = \`
          <div class="empty-state">
            <div class="icon-spin" style="width: 24px; height: 24px; border-width: 3px;"></div>
            <h3>Executing Standalone API...</h3>
            <p>Please respond to any input prompts in VS Code if required.</p>
          </div>
        \`;
        return;
      }

      const req = state.standaloneData.request || {};
      const res = state.standaloneData.response || {};
      const duration = state.standaloneData.duration;

      let statusColor = 'var(--text-muted)';
      if (res.status >= 200 && res.status < 300) { statusColor = 'var(--accent-green)'; }
      else if (res.status > 0) { statusColor = 'var(--accent-red)'; }

      let headerHtml = \`
        <div class="inspector-header">
          <div class="inspector-title-row">
            <h2 class="inspector-title">API Execution: #\${state.standaloneApiName}</h2>
            <span class="status-badge" style="background-color:rgba(255,255,255,0.02); color:\${statusColor}; border-color:\${statusColor};">\${res.status || 'RUNNING'}</span>
          </div>
          <div class="inspector-subtitle">
            <span class="method-badge \${req.method}">\${req.method || 'GET'}</span>
            <span>\${req.url || ''}</span>
          </div>
          <div class="inspector-metrics">
            \${duration !== undefined ? \`
              <div class="metric-box">
                <div class="metric-value">\${duration}ms</div>
                <div class="metric-label">Duration</div>
              </div>
            \` : ''}
            \${res.status ? \`
              <div class="metric-box">
                <div class="metric-value" style="color:\${res.status >= 200 && res.status < 300 ? 'var(--accent-green)' : 'var(--accent-red)'}">
                  \${res.status}
                </div>
                <div class="metric-label">HTTP Status</div>
              </div>
            \` : ''}
          </div>
        </div>
      \`;

      let activeTab = document.querySelector('.tab-btn.active')?.dataset.tab || 'request';
      if (activeTab === 'captures' || activeTab === 'checks') {
        activeTab = 'request';
      }

      let tabsHeaderHtml = \`
        <div class="tabs-header">
          <button class="tab-btn \${activeTab === 'request' ? 'active' : ''}" data-tab="request" onclick="switchTab('request')">Request</button>
          <button class="tab-btn \${activeTab === 'body' ? 'active' : ''}" data-tab="body" onclick="switchTab('body')">Response Body</button>
          <button class="tab-btn \${activeTab === 'headers' ? 'active' : ''}" data-tab="headers" onclick="switchTab('headers')">Response Headers</button>
        </div>
      \`;

      let reqHeadersHtml = '<div style="color:var(--text-muted); font-size:12px;">No request headers.</div>';
      if (req.headers && Object.keys(req.headers).length > 0) {
        reqHeadersHtml = \`
          <table class="header-table">
            <thead>
              <tr><th>Header</th><th>Value</th></tr>
            </thead>
            <tbody>
              \${Object.entries(req.headers).map(([k, v]) => \`
                <tr><td>\${k}</td><td>\${v}</td></tr>
              \`).join('')}
            </tbody>
          </table>
        \`;
      }

      let reqBodyContent = req.body ? String(req.body) : 'No request body.';

      let requestTabHtml = \`
        <div class="tab-content \${activeTab === 'request' ? 'active' : ''}" id="tab-request">
          <h4 style="margin-bottom: 8px; font-size: 13px; color:var(--text-color);">Request Headers</h4>
          \${reqHeadersHtml}
          <h4 style="margin-top: 16px; margin-bottom: 8px; font-size: 13px; color:var(--text-color);">Request Body</h4>
          <pre class="code-block">\${escapeHtml(reqBodyContent)}</pre>
        </div>
      \`;

      let resBodyContent = 'No response payload received.';
      if (res.body !== undefined && res.body !== null) {
        if (typeof res.body === 'object') {
          resBodyContent = JSON.stringify(res.body, null, 2);
        } else {
          resBodyContent = String(res.body);
        }
      }

      let responseBodyHtml = \`
        <div class="tab-content \${activeTab === 'body' ? 'active' : ''}" id="tab-body">
          <pre class="code-block">\${escapeHtml(resBodyContent)}</pre>
        </div>
      \`;

      let resHeadersHtml = '<div style="color:var(--text-muted); font-size:12px;">No response headers.</div>';
      if (res.headers && Object.keys(res.headers).length > 0) {
        resHeadersHtml = \`
          <table class="header-table">
            <thead>
              <tr><th>Header</th><th>Value</th></tr>
            </thead>
            <tbody>
              \${Object.entries(res.headers).map(([k, v]) => \`
                <tr><td>\${k}</td><td>\${v}</td></tr>
              \`).join('')}
            </tbody>
          </table>
        \`;
      }

      let responseHeadersHtml = \`
        <div class="tab-content \${activeTab === 'headers' ? 'active' : ''}" id="tab-headers">
          \${resHeadersHtml}
        </div>
      \`;

      let dummyTabsHtml = \`
        <div class="tab-content" id="tab-captures" style="display:none;"></div>
        <div class="tab-content" id="tab-checks" style="display:none;"></div>
      \`;

      inspector.innerHTML = headerHtml + tabsHeaderHtml + requestTabHtml + responseBodyHtml + responseHeadersHtml + dummyTabsHtml;
    }

    function switchTab(tabName) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      const targetBtn = document.querySelector(\`.tab-btn[data-tab="\${tabName}"]\`);
      const targetContent = document.getElementById('tab-' + tabName);
      
      if (targetBtn && targetContent) {
        targetBtn.classList.add('active');
        targetContent.classList.add('active');
      }
    }

    function appendLog(level, message) {
      const container = document.getElementById('console-rows-container');
      const row = document.createElement('div');
      row.className = 'console-row ' + level;
      
      const timeStr = new Date().toLocaleTimeString();
      row.innerText = \`[\${timeStr}] [\${level.toUpperCase()}] \${message}\`;
      
      container.appendChild(row);
      
      if (document.getElementById('autoscroll-chk').checked) {
        container.scrollTop = container.scrollHeight;
      }
    }

    function logSystem(message) {
      appendLog('system', message);
    }

    function clearLogs() {
      document.getElementById('console-rows-container').innerHTML = '';
    }

    function handleGlobalError(err) {
      logSystem('ERROR: ' + err.message);
      
      document.getElementById('main-container').classList.add('has-selection');
      const inspector = document.getElementById('step-inspector');
      
      const banner = \`
        <div class="error-banner" style="margin-top: 10px;">
          <div class="error-banner-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>Compilation / Runtime Error</span>
          </div>
          <div class="error-banner-desc">\${escapeHtml(err.message)}</div>
          \${err.line !== undefined ? \`<div style="font-size:11px; color:rgba(255,255,255,0.7)">Line: \${err.line}, Column: \${err.column}</div>\` : ''}
        </div>
      \`;
      
      inspector.innerHTML = banner;
      updateStatus('failed');
      setRunButtonState(false);
      stopTimer();
    }

    function escapeHtml(text) {
      const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      };
      return text.replace(/[&<>"']/g, m => map[m]);
    }
  </script>
</body>
</html>
`;
}
