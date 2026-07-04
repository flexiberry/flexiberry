import { writable } from "svelte/store";
import { BerryCore, InterpreterEvent, ExecutionCommand } from "@flexiberry/berrycore";
import { WebUIAdapter } from "./WebUIAdapter";
import type { RunInstance, PlanTask, PlanStep } from "./execution.types";
import { toast } from "svelte-sonner";
import { db } from "$lib/db/db";

export const executions = writable<RunInstance[]>([]);

// Keep a reference to original fetch to restore it
const originalFetch = window.fetch;
const requestDetailsMap = new Map<string, { headers: any; body: any }>();

function cleanupFetch() {
  executions.update((list) => {
    const anyRunning = list.some(e => e.status === "running");
    if (!anyRunning) {
      window.fetch = originalFetch;
    }
    return list;
  });
}

export function runBerryFile(fileName: string, text: string, workspaceId: string = "default") {
  if (!text.trim()) {
    toast.error("Cannot run an empty file.");
    return;
  }

  // Monkeypatch fetch if not already done
  if (window.fetch === originalFetch) {
    window.fetch = async (input, init) => {
      const urlStr = typeof input === "string" ? input : (input as Request).url;
      // Capture headers and body robustly
      let requestHeaders: Record<string, string> = {};
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((val, key) => {
            requestHeaders[key] = val;
          });
        } else if (Array.isArray(init.headers)) {
          init.headers.forEach(([key, val]) => {
            requestHeaders[key] = val;
          });
        } else {
          requestHeaders = { ...init.headers } as Record<string, string>;
        }
      }
      requestDetailsMap.set(urlStr, {
        headers: requestHeaders,
        body: init?.body ?? null
      });
      return originalFetch(input, init);
    };
  }

  const executionId = Math.random().toString(36).substring(2, 9);
  let resolvePromptFn: ((val: string) => void) | null = null;

  const adapter = new WebUIAdapter((message) => {
    executions.update((list) => {
      const execIndex = list.findIndex(e => e.id === executionId);
      if (execIndex !== -1) {
        list[execIndex].promptActive = true;
        list[execIndex].promptMessage = message;
        list[execIndex].promptValue = "";
      }
      return [...list];
    });
    return new Promise<string>((resolve) => {
      resolvePromptFn = resolve;
    });
  });

  const core = new BerryCore(text, { 
    adapter,
    linkResolver: async (linkPath: string) => {
      // 1. HTTP/HTTPS URLs
      if (linkPath.startsWith("http://") || linkPath.startsWith("https://")) {
        const response = await fetch(linkPath);
        if (!response.ok) {
          throw new Error(`Failed to fetch URL ${linkPath}: ${response.statusText}`);
        }
        return await response.text();
      }

      // 2. Local workspace files (folderName/fileName or fileName)
      const parts = linkPath.split("/");
      let lookupFolderId: string | null = null;
      let lookupFileName = linkPath;

      if (parts.length >= 2) {
        const folderName = parts[0];
        lookupFileName = parts[1];
        
        // Resolve folder ID from folder name
        const allFolders = await db.folderTable
          .where("workspaceId")
          .equals(workspaceId)
          .toArray();
        const targetFolder = allFolders.find(
          (f) => f.data?.[0]?.name?.toLowerCase() === folderName.toLowerCase()
        );
        if (targetFolder) {
          lookupFolderId = targetFolder.id;
        }
      }

      // Lookup file from db.fileStore
      let record = await db.fileStore
        .where("workspaceId")
        .equals(workspaceId)
        .and((f) => f.name === lookupFileName && (f.folderId ?? null) === (lookupFolderId ?? null))
        .first();

      // Fallback: name-only inside workspace
      if (!record) {
        record = await db.fileStore
          .where("workspaceId")
          .equals(workspaceId)
          .and((f) => f.name === lookupFileName)
          .first();
      }

      if (record?.data) {
        return new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsText(record.data);
        });
      }

      throw new Error(`Linked file '${linkPath}' not found in workspace.`);
    }
  });

  const newExecution: RunInstance = {
    id: executionId,
    fileName,
    status: "running",
    startTime: new Date(),
    elapsedTime: 0,
    logs: [],
    core,
    adapter,
    minimized: true,
    isFullscreen: false,
    completedSteps: 0,
    totalSteps: 0,
    promptActive: false,
    promptMessage: "",
    promptValue: "",
    plan: [],
    forceShowPopover: true,
    resolvePrompt: (val: string) => {
      if (resolvePromptFn) {
        resolvePromptFn(val);
        resolvePromptFn = null;
      }
    }
  };

  executions.update((list) => [...list, newExecution]);


  executions.update((list) => {
    const idx = list.findIndex(e => e.id === executionId);
    if (idx !== -1 && list[idx].status === "running") {
      list[idx].forceShowPopover = true;
    }
    return [...list];
  });
  const log = (msg: string, level: "info" | "warn" | "error" | "system" = "info") => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1) {
        list[idx].logs = [
          ...list[idx].logs,
          {
            time: new Date().toLocaleTimeString(),
            level,
            msg
          }
        ];
      }
      return [...list];
    });
  };

  log(`Starting execution of ${fileName}...`, "system");

  const timer = setInterval(() => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1 && list[idx].status === "running") {
        list[idx].elapsedTime = Math.round((Date.now() - list[idx].startTime.getTime()) / 100) / 10;
        return [...list];
      } else {
        clearInterval(timer);
        return list;
      }
    });
  }, 100);

  executions.update((list) => {
    const idx = list.findIndex(e => e.id === executionId);
    if (idx !== -1) {
      list[idx].timerInterval = timer;
    }
    return list;
  });

  const apiToUrlMap = new Map<string, string>();
  const apiToMethodMap = new Map<string, string>();

  core.on(InterpreterEvent.Start, (payload) => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1) {
        list[idx].totalSteps = payload.plan.reduce((sum, task) => sum + task.steps.length, 0);
        list[idx].plan = payload.plan.map((task) => ({
          title: task.title,
          status: "pending",
          steps: task.steps.map((step) => ({
            targetName: step.targetName,
            status: "pending"
          }))
        }));
      }
      return [...list];
    });
    log(`Execution started. Planned tasks: ${payload.totalTasks}, steps: ${newExecution.totalSteps}`, "system");
  });

  core.on(InterpreterEvent.TaskBegin, (payload) => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1) {
        list[idx].currentTask = payload.title || `Task ${payload.index + 1}`;
        if (list[idx].plan[payload.index]) {
          list[idx].plan[payload.index].status = "running";
        }
      }
      return [...list];
    });
    log(`Starting task: ${payload.title || `Task ${payload.index + 1}`}`, "system");
  });

  core.on(InterpreterEvent.StepBegin, (payload) => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1) {
        list[idx].currentStep = payload.targetName;
        const taskIndex = payload.taskIndex;
        const stepIndex = payload.index;
        if (list[idx].plan[taskIndex]?.steps[stepIndex]) {
          list[idx].plan[taskIndex].steps[stepIndex].status = "running";
        }
      }
      return [...list];
    });
    log(`Executing step: ${payload.targetName}`, "system");
  });

  core.on(InterpreterEvent.ApiCallBegin, (payload) => {
    apiToUrlMap.set(payload.apiName, payload.url);
    apiToMethodMap.set(payload.apiName, payload.method || "GET");
    log(`--> API Call Outgoing: ${payload.method} ${payload.url}`, "system");
  });

  core.on(InterpreterEvent.StepDone, (payload) => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1) {
        list[idx].completedSteps += 1;
        const taskIndex = payload.taskIndex;
        const stepIndex = payload.index;
        const stepObj = list[idx].plan[taskIndex]?.steps[stepIndex];
        if (stepObj) {
          stepObj.status =
            payload.status === "PASS" ? "completed" : payload.status === "FAILED" ? "failed" : "skipped";
          stepObj.duration =
            payload.endTime.getTime() - payload.startTime.getTime();

          const url = apiToUrlMap.get(payload.targetName);
          if (url) {
            const reqInfo = requestDetailsMap.get(url);
            stepObj.request = {
              url,
              method: apiToMethodMap.get(payload.targetName) || "GET",
              headers: reqInfo?.headers,
              body: reqInfo?.body
            };
          }
          if (payload.response) {
            stepObj.response = {
              status: payload.response.status,
              headers: payload.response.headers,
              body: payload.response.body
            };
          }
          if (payload?.captures) {
            stepObj.captures = payload.captures;
          }
          if (payload?.checks) {
            stepObj.checks = payload.checks;
          }
          if (payload.error) {
            stepObj.error = payload.error;
          }
        }
      }
      return [...list];
    });

    const statusText = payload.status === "PASS" ? "PASS" : "FAIL";
    const logType = payload.status === "PASS" ? "system" : "error";
    log(`Step completed: ${payload.targetName} (${statusText})`, logType);

    // Print detailed Request & Response logs for debugging
    const url = apiToUrlMap.get(payload.targetName);
    const reqInfo = url ? requestDetailsMap.get(url) : null;
    if (reqInfo) {
      log(`[Request Details for #${payload.targetName}]:`, "info");
      log(`  URL: ${url}`, "info");
      if (Object.keys(reqInfo.headers).length > 0) {
        log(`  Headers: ${JSON.stringify(reqInfo.headers, null, 2)}`, "info");
      }
      if (reqInfo.body) {
        log(`  Body: ${reqInfo.body}`, "info");
      }
    }

    if (payload.response) {
      log(`[Response Details for #${payload.targetName}]:`, "info");
      log(`  Status: ${payload.response.status}`, "info");
      if (Object.keys(payload.response.headers).length > 0) {
        log(`  Headers: ${JSON.stringify(payload.response.headers, null, 2)}`, "info");
      }
      if (payload.response.body) {
        const bodyStr = typeof payload.response.body === "object"
          ? JSON.stringify(payload.response.body, null, 2)
          : String(payload.response.body);
        log(`  Body: ${bodyStr}`, "info");
      }
    }

    if (payload.error) {
      log(`Error details: ${payload.error}`, "error");
    }
  });

  core.on(InterpreterEvent.Log, (payload) => {
    log(payload.message, payload.level === "warn" ? "warn" : "info");
  });

  core.on(InterpreterEvent.Error, (payload) => {
    log(`Runtime error: ${payload.message}${payload.line ? ` at line ${payload.line}` : ""}`, "error");
  });

  core.on(InterpreterEvent.Completed, (payload) => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1) {
        list[idx].status = "completed";
        list[idx].endTime = payload.endTime;
        list[idx].elapsedTime = Math.round((payload.endTime.getTime() - list[idx].startTime.getTime()) / 100) / 10;

        // Mark remaining pending/running tasks in plan as completed
        list[idx].plan.forEach((task) => {
          if (task.status === "running" || task.status === "pending") {
            task.status = "completed";
          }
        });
      }
      return [...list];
    });
    log(`Execution completed successfully.`, "system");
    clearInterval(timer);
    cleanupFetch();

    setTimeout(() => {
      executions.update((list) => {
        const idx = list.findIndex(e => e.id === executionId);
        if (idx !== -1) {
          list[idx].forceShowPopover = false;
        }
        return [...list];
      });
    }, 3000);
  });

  core.run().catch((err) => {
    executions.update((list) => {
      const idx = list.findIndex(e => e.id === executionId);
      if (idx !== -1) {
        list[idx].status = "failed";
        list[idx].endTime = new Date();
        list[idx].elapsedTime = Math.round((Date.now() - list[idx].startTime.getTime()) / 100) / 10;
        list[idx].error = err.message;

        list[idx].plan.forEach((task) => {
          if (task.status === "running") task.status = "failed";
        });
      }
      return [...list];
    });
    log(`Execution failed: ${err.message}`, "error");
    clearInterval(timer);
    cleanupFetch();

    setTimeout(() => {
      executions.update((list) => {
        const idx = list.findIndex(e => e.id === executionId);
        if (idx !== -1) {
          list[idx].forceShowPopover = false;
        }
        return [...list];
      });
    }, 3000);
  });
}

export function killExecution(id: string) {
  executions.update((list) => {
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      const exec = list[idx];
      try {
        exec.adapter.triggerCommand(ExecutionCommand.Kill);
        exec.core.kill();
        exec.status = "killed";
        exec.logs = [
          ...exec.logs,
          {
            time: new Date().toLocaleTimeString(),
            level: "error",
            msg: "Execution killed by user."
          }
        ];
        if (exec.timerInterval) clearInterval(exec.timerInterval);
        toast.info("Execution stopped");
        cleanupFetch();
      } catch (e: any) {
        toast.error("Failed to stop execution", { description: e.message });
      }
    }
    return [...list];
  });
}

export function closeExecution(id: string) {
  executions.update((list) => {
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      const exec = list[idx];
      if (exec.timerInterval) clearInterval(exec.timerInterval);
      if (exec.status === "running") {
        try {
          exec.core.kill();
        } catch { }
      }
    }
    return list.filter(e => e.id !== id);
  });
  cleanupFetch();
}

export function toggleMinimize(id: string) {
  executions.update((list) => {
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx].minimized = !list[idx].minimized;
      if (list[idx].minimized) {
        list[idx].isFullscreen = false;
      }
    }
    return [...list];
  });
}

export function toggleFullscreen(id: string) {
  executions.update((list) => {
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      list[idx].isFullscreen = !list[idx].isFullscreen;
      if (list[idx].isFullscreen) {
        list[idx].minimized = false;
      }
    }
    return [...list];
  });
}

export function submitPromptInput(id: string, value: string) {
  executions.update((list) => {
    const idx = list.findIndex(e => e.id === id);
    if (idx !== -1) {
      const exec = list[idx];
      exec.promptActive = false;
      exec.promptMessage = "";
      exec.promptValue = "";
      exec.resolvePrompt?.(value);
    }
    return [...list];
  });
}
