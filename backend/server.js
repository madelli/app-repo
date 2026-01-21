/**
 * Cold Operator Gateway Server
 *
 * WebSocket server that bridges the browser-based RemoteInterface (Layer 5)
 * to shell commands and Claude Code CLI running in the local environment.
 *
 * Supports two command types:
 *   - Shell commands: ls, cat, git, mv, rm, mkdir, etc.
 *   - Claude commands: Natural language instructions for code editing
 *
 * Protocol:
 *   - Inbound:  { type: "command" | "ping", command?: string, options?: object }
 *   - Outbound: { type: "system" | "stdout" | "stderr" | "exit" | "error" | "pong", ... }
 */

import { WebSocketServer } from "ws";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const PORT = 9999;

// Resolve PROJECT_ROOT to one directory above backend/
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = resolve(__dirname, "..");

// ---------------------------------------------------------------------------
// Message Types
// ---------------------------------------------------------------------------

const MessageType = {
  // Inbound (from browser)
  COMMAND: "command",
  CLAUDE_COMMAND: "claude_command", // Legacy support
  PING: "ping",

  // Outbound (to browser)
  SYSTEM: "system",
  STDOUT: "stdout",
  STDERR: "stderr",
  EXIT: "exit",
  ERROR: "error",
  PONG: "pong",
};

// ---------------------------------------------------------------------------
// Command Classification
// ---------------------------------------------------------------------------

// Shell command prefixes - commands that start with these are treated as shell
const SHELL_PREFIXES = [
  "!", // Explicit shell prefix
  "$", // Explicit shell prefix
  "sh:", // Explicit shell prefix
  "shell:", // Explicit shell prefix
];

// Common shell commands/verbs
const SHELL_COMMANDS = [
  // File operations
  "ls", "cat", "head", "tail", "less", "more",
  "cp", "mv", "rm", "mkdir", "rmdir", "touch",
  "chmod", "chown", "chgrp",
  "ln", "find", "locate", "which", "whereis",
  // Text processing
  "grep", "sed", "awk", "sort", "uniq", "wc",
  "cut", "tr", "diff", "patch",
  // Archive/compression
  "tar", "gzip", "gunzip", "zip", "unzip",
  // Network
  "curl", "wget", "ssh", "scp", "rsync",
  "ping", "netstat", "ifconfig", "ip",
  // Process management
  "ps", "top", "htop", "kill", "killall",
  "bg", "fg", "jobs", "nohup",
  // Git
  "git",
  // Package managers
  "npm", "npx", "yarn", "pnpm",
  "pip", "pip3", "python", "python3",
  "node", "deno", "bun",
  "cargo", "rustc",
  "go", "make", "cmake",
  // System info
  "pwd", "whoami", "hostname", "uname",
  "date", "cal", "uptime", "free", "df", "du",
  // Editors (usually not useful via WebSocket, but included)
  "echo", "printf", "env", "export", "source",
  // Directory navigation
  "cd", "pushd", "popd",
];

/**
 * Classify a command as either "shell" or "claude"
 * @param {string} command - The command string to classify
 * @returns {{ type: "shell" | "claude", cleanCommand: string }}
 */
function classifyCommand(command) {
  const trimmed = command.trim();
  const lower = trimmed.toLowerCase();

  // Check explicit shell prefixes
  for (const prefix of SHELL_PREFIXES) {
    if (lower.startsWith(prefix)) {
      // Remove the prefix and return as shell command
      const cleanCommand = trimmed.slice(prefix.length).trim();
      return { type: "shell", cleanCommand };
    }
  }

  // Check if command starts with a known shell command
  const firstWord = lower.split(/\s+/)[0];
  if (SHELL_COMMANDS.includes(firstWord)) {
    return { type: "shell", cleanCommand: trimmed };
  }

  // Check for common shell patterns
  // Piped commands
  if (trimmed.includes(" | ") || trimmed.includes(" > ") || trimmed.includes(" >> ")) {
    return { type: "shell", cleanCommand: trimmed };
  }

  // Commands starting with ./ or /
  if (trimmed.startsWith("./") || trimmed.startsWith("/")) {
    return { type: "shell", cleanCommand: trimmed };
  }

  // Default to Claude command
  return { type: "claude", cleanCommand: trimmed };
}

// ---------------------------------------------------------------------------
// Utility Functions
// ---------------------------------------------------------------------------

/**
 * Create a JSON message string for sending to clients
 */
function createMessage(type, payload = {}) {
  return JSON.stringify({
    type,
    timestamp: new Date().toISOString(),
    ...payload,
  });
}

/**
 * Safely parse incoming JSON message
 */
function parseMessage(data) {
  try {
    const parsed = JSON.parse(data.toString());
    return { success: true, data: parsed };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

/**
 * Log with timestamp
 */
function log(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
  console.log(`[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`);
}

// ---------------------------------------------------------------------------
// Process Execution
// ---------------------------------------------------------------------------

/**
 * Execute a shell command via bash
 */
function executeShellCommand(ws, command) {
  const preview = command.length > 60 ? command.substring(0, 60) + "..." : command;
  log("info", "Executing shell command", { command: preview });

  // Notify client
  ws.send(
    createMessage(MessageType.SYSTEM, {
      message: `Executing shell command: ${preview}`,
      commandType: "shell",
    })
  );

  const proc = spawn("bash", ["-c", command], {
    cwd: PROJECT_ROOT,
    env: process.env,
  });

  return proc;
}

/**
 * Execute a Claude Code command
 */
function executeClaudeCommand(ws, command) {
  const preview = command.length > 60 ? command.substring(0, 60) + "..." : command;
  log("info", "Executing Claude command", { command: preview });

  // Notify client
  ws.send(
    createMessage(MessageType.SYSTEM, {
      message: `Executing Claude command: ${preview}`,
      commandType: "claude",
    })
  );

  // Use -p flag for print mode (non-interactive)
  const proc = spawn("claude", ["-p", command], {
    cwd: PROJECT_ROOT,
    env: {
      ...process.env,
      TERM: "dumb", // Ensure non-interactive mode
    },
  });

  return proc;
}

/**
 * Attach process event handlers and track the process
 */
function attachProcessHandlers(ws, proc, commandType) {
  // Track process for this connection
  if (!ws.activeProcesses) {
    ws.activeProcesses = new Set();
  }
  ws.activeProcesses.add(proc);

  // Handle stdout
  proc.stdout.on("data", (data) => {
    const text = data.toString();
    log("debug", `${commandType} stdout`, { length: text.length });
    ws.send(
      createMessage(MessageType.STDOUT, {
        message: text,
        commandType,
      })
    );
  });

  // Handle stderr
  proc.stderr.on("data", (data) => {
    const text = data.toString();
    log("debug", `${commandType} stderr`, { length: text.length });
    ws.send(
      createMessage(MessageType.STDERR, {
        message: text,
        commandType,
      })
    );
  });

  // Handle process exit
  proc.on("close", (code, signal) => {
    log("info", `${commandType} process exited`, { code, signal });
    ws.activeProcesses?.delete(proc);
    ws.send(
      createMessage(MessageType.EXIT, {
        code,
        signal,
        commandType,
        message: code === 0 ? "Command completed successfully" : `Command exited with code ${code}`,
      })
    );
  });

  // Handle process error
  proc.on("error", (err) => {
    log("error", `${commandType} process error`, { error: err.message });
    ws.activeProcesses?.delete(proc);
    ws.send(
      createMessage(MessageType.ERROR, {
        message: `Failed to execute ${commandType} command: ${err.message}`,
        commandType,
        details: {
          code: err.code,
          errno: err.errno,
        },
      })
    );
  });
}

// ---------------------------------------------------------------------------
// Command Handlers
// ---------------------------------------------------------------------------

/**
 * Handle incoming command (auto-classifies as shell or claude)
 */
function handleCommand(ws, message) {
  const { command, options = {} } = message;

  if (!command || typeof command !== "string") {
    ws.send(
      createMessage(MessageType.ERROR, {
        message: "Invalid command: 'command' field is required and must be a string",
      })
    );
    return;
  }

  // Classify the command
  const { type: commandType, cleanCommand } = classifyCommand(command);

  // Allow forcing command type via options
  const forcedType = options.forceType;
  const finalType = forcedType === "shell" || forcedType === "claude" ? forcedType : commandType;
  const finalCommand = forcedType ? command.trim() : cleanCommand;

  // Execute based on type
  let proc;
  if (finalType === "shell") {
    proc = executeShellCommand(ws, finalCommand);
  } else {
    proc = executeClaudeCommand(ws, finalCommand);
  }

  // Attach handlers
  attachProcessHandlers(ws, proc, finalType);
}

/**
 * Handle ping request
 */
function handlePing(ws, message) {
  ws.send(
    createMessage(MessageType.PONG, {
      message: "pong",
      echo: message.data || null,
    })
  );
}

/**
 * Registry of command handlers
 */
const commandHandlers = {
  [MessageType.COMMAND]: handleCommand,
  [MessageType.CLAUDE_COMMAND]: handleCommand, // Legacy support - same handler
  [MessageType.PING]: handlePing,
};

// ---------------------------------------------------------------------------
// WebSocket Server
// ---------------------------------------------------------------------------

/**
 * Initialize and start the WebSocket server
 */
function startServer() {
  const wss = new WebSocketServer({
    port: PORT,
    verifyClient: (info, callback) => {
      // In production, implement origin verification here
      callback(true);
    },
  });

  log("info", `Cold Operator Gateway starting on ws://localhost:${PORT}`);
  log("info", `Project root: ${PROJECT_ROOT}`);
  log("info", "Supported command types: shell, claude (auto-classified)");

  wss.on("connection", (ws, req) => {
    const clientId = `client-${Date.now().toString(36)}`;
    const clientAddress = req.socket.remoteAddress;

    log("info", "Client connected", { clientId, address: clientAddress });

    // Send connection acknowledgment
    ws.send(
      createMessage(MessageType.SYSTEM, {
        message: "Connected to Cold Operator Gateway",
        clientId,
        projectRoot: PROJECT_ROOT,
        version: "2.0.0",
        features: ["shell-commands", "claude-commands", "auto-classification"],
      })
    );

    // Handle incoming messages
    ws.on("message", (data) => {
      const parsed = parseMessage(data);

      if (!parsed.success) {
        log("warn", "Invalid JSON received", { error: parsed.error });
        ws.send(
          createMessage(MessageType.ERROR, {
            message: `Invalid JSON: ${parsed.error}`,
          })
        );
        return;
      }

      const message = parsed.data;
      const { type } = message;

      log("debug", "Message received", { type, clientId });

      // Route to appropriate handler
      const handler = commandHandlers[type];
      if (handler) {
        handler(ws, message);
      } else {
        log("warn", "Unknown message type", { type });
        ws.send(
          createMessage(MessageType.ERROR, {
            message: `Unknown message type: ${type}`,
            supportedTypes: Object.keys(commandHandlers),
          })
        );
      }
    });

    // Handle client disconnect
    ws.on("close", (code, reason) => {
      log("info", "Client disconnected", {
        clientId,
        code,
        reason: reason.toString() || "No reason provided",
      });

      // Kill any active processes for this client
      if (ws.activeProcesses) {
        for (const proc of ws.activeProcesses) {
          log("info", "Killing orphaned process", { pid: proc.pid });
          proc.kill("SIGTERM");
        }
        ws.activeProcesses.clear();
      }
    });

    // Handle errors
    ws.on("error", (err) => {
      log("error", "WebSocket error", { clientId, error: err.message });
    });
  });

  // Handle server errors
  wss.on("error", (err) => {
    log("error", "Server error", { error: err.message });
    if (err.code === "EADDRINUSE") {
      log("error", `Port ${PORT} is already in use. Please close other instances.`);
      process.exit(1);
    }
  });

  // Graceful shutdown
  const shutdown = (signal) => {
    log("info", `Received ${signal}, shutting down gracefully...`);

    wss.clients.forEach((ws) => {
      ws.send(
        createMessage(MessageType.SYSTEM, {
          message: "Server shutting down",
        })
      );
      ws.close(1001, "Server shutting down");
    });

    wss.close(() => {
      log("info", "Server closed");
      process.exit(0);
    });

    // Force exit after timeout
    setTimeout(() => {
      log("warn", "Forced shutdown after timeout");
      process.exit(1);
    }, 5000);
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));

  log("info", "Gateway server ready and listening for connections");
}

// ---------------------------------------------------------------------------
// Entry Point
// ---------------------------------------------------------------------------

startServer();
