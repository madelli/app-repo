/**
 * Cold Operator - Remote Interface (Layer 5)
 *
 * WebSocket client for communicating with the Cold Operator Gateway server.
 * Bridges the browser UI to Claude Code CLI via WebSocket protocol.
 */
import React, { useState, useEffect, useRef, useCallback } from "react";
import "./RemoteInterface.css";

// 接続ステータス定義
const CONNECTION_STATUS = {
  DISCONNECTED: { label: "Disconnected", color: "#666" },
  CONNECTING: { label: "Connecting...", color: "#f0ad4e" },
  CONNECTED: { label: "Connected", color: "#5cb85c" },
  ERROR: { label: "Connection Error", color: "#d9534f" }
};

const RemoteInterface = () => {
  const [connectionStatus, setConnectionStatus] = useState("DISCONNECTED");
  const [targetEndpoint, setTargetEndpoint] = useState("ws://localhost:9999");
  const [commandInput, setCommandInput] = useState("");
  const [messageLog, setMessageLog] = useState([]);

  // WebSocket reference
  const wsRef = useRef(null);

  // Log entry helper - stable reference for useEffect
  const addLog = useCallback((type, message) => {
    const timestamp = new Date().toLocaleTimeString();
    setMessageLog((prev) => [...prev, { timestamp, type, message }]);
  }, []);

  // Map server message types to log types
  const mapMessageType = (serverType) => {
    switch (serverType) {
      case "stdout":
        return "incoming";
      case "stderr":
        return "error";
      case "system":
      case "exit":
      case "pong":
        return "system";
      case "error":
        return "error";
      default:
        return "system";
    }
  };

  // Handle incoming WebSocket messages
  const handleMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.data);
      const logType = mapMessageType(data.type);
      const message = data.message || JSON.stringify(data);
      addLog(logType, message);
    } catch (err) {
      addLog("error", `Failed to parse message: ${event.data}`);
    }
  }, [addLog]);

  // Connect to WebSocket server
  const handleConnect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setConnectionStatus("CONNECTING");
    addLog("system", `Connecting to ${targetEndpoint}...`);

    try {
      const ws = new WebSocket(targetEndpoint);

      ws.onopen = () => {
        setConnectionStatus("CONNECTED");
        addLog("system", "Connected to Cold Operator Gateway");
      };

      ws.onmessage = handleMessage;

      ws.onclose = (event) => {
        setConnectionStatus("DISCONNECTED");
        const reason = event.reason || "Connection closed";
        addLog("system", `Disconnected: ${reason} (code: ${event.code})`);
        wsRef.current = null;
      };

      ws.onerror = () => {
        setConnectionStatus("ERROR");
        addLog("error", "WebSocket error occurred");
      };

      wsRef.current = ws;
    } catch (err) {
      setConnectionStatus("ERROR");
      addLog("error", `Failed to connect: ${err.message}`);
    }
  }, [targetEndpoint, addLog, handleMessage]);

  // Disconnect from WebSocket server
  const handleDisconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close(1000, "User disconnected");
      wsRef.current = null;
    }
    setConnectionStatus("DISCONNECTED");
    addLog("system", "Disconnected by user");
  }, [addLog]);

  // Send command via WebSocket
  const handleSendCommand = useCallback(() => {
    if (!commandInput.trim()) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      addLog("error", "Not connected. Please connect first.");
      return;
    }

    // Log outgoing command
    addLog("outgoing", commandInput);

    // Send JSON message to server
    const message = {
      type: "claude_command",
      command: commandInput,
      options: {},
    };

    try {
      wsRef.current.send(JSON.stringify(message));
    } catch (err) {
      addLog("error", `Failed to send: ${err.message}`);
    }

    setCommandInput("");
  }, [commandInput, addLog]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close(1000, "Component unmounted");
      }
    };
  }, []);

  // Enter キーで送信
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendCommand();
    }
  };

  // ログクリア
  const clearLog = () => {
    setMessageLog([]);
    addLog("system", "Log cleared.");
  };

  const status = CONNECTION_STATUS[connectionStatus];

  return (
    <div className="remote-container">
      {/* ヘッダー */}
      <header className="remote-header">
        <div className="remote-title">
          <h1>Remote Interface</h1>
          <span className="layer-tag">Layer 5 - 外界接続層</span>
        </div>
        <div
          className="connection-indicator"
          style={{ backgroundColor: status.color }}
        >
          {status.label}
        </div>
      </header>

      {/* 接続設定 */}
      <section className="connection-panel">
        <h2>Connection Settings</h2>
        <div className="connection-form">
          <div className="input-group">
            <label htmlFor="endpoint">Target Endpoint</label>
            <input
              id="endpoint"
              type="text"
              value={targetEndpoint}
              onChange={(e) => setTargetEndpoint(e.target.value)}
              placeholder="ws://localhost:9999"
              disabled={connectionStatus === "CONNECTED"}
            />
          </div>
          <div className="connection-buttons">
            {connectionStatus !== "CONNECTED" ? (
              <button
                className="btn connect-btn"
                onClick={handleConnect}
                disabled={connectionStatus === "CONNECTING"}
              >
                {connectionStatus === "CONNECTING" ? "Connecting..." : "Connect"}
              </button>
            ) : (
              <button className="btn disconnect-btn" onClick={handleDisconnect}>
                Disconnect
              </button>
            )}
          </div>
        </div>
      </section>

      {/* メッセージログ */}
      <section className="message-panel">
        <div className="panel-header">
          <h2>Message Log</h2>
          <button className="btn-small" onClick={clearLog}>
            Clear
          </button>
        </div>
        <div className="message-log">
          {messageLog.length === 0 ? (
            <div className="log-empty">No messages yet.</div>
          ) : (
            messageLog.map((entry, idx) => (
              <div key={idx} className={`log-entry ${entry.type}`}>
                <span className="log-time">[{entry.timestamp}]</span>
                <span className={`log-type-badge ${entry.type}`}>
                  {entry.type === "outgoing"
                    ? "OUT"
                    : entry.type === "incoming"
                    ? "IN"
                    : entry.type === "error"
                    ? "ERR"
                    : "SYS"}
                </span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* コマンド入力 */}
      <section className="command-panel">
        <h2>Send Command to Claude Code</h2>
        <div className="command-form">
          <textarea
            className="command-input"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command or instruction for Claude Code..."
            rows={3}
          />
          <button
            className="btn send-btn"
            onClick={handleSendCommand}
            disabled={!commandInput.trim() || connectionStatus !== "CONNECTED"}
          >
            Send Command
          </button>
        </div>
        <p className="hint">
          Press Enter to send. This interface will communicate with Claude Code running in VSCode.
        </p>
      </section>

      {/* クイックコマンド */}
      <section className="quick-commands">
        <h2>Quick Commands</h2>
        <div className="quick-buttons">
          <button
            className="quick-btn"
            onClick={() => setCommandInput("/status")}
          >
            /status
          </button>
          <button
            className="quick-btn"
            onClick={() => setCommandInput("/help")}
          >
            /help
          </button>
          <button
            className="quick-btn"
            onClick={() => setCommandInput("/layers")}
          >
            /layers
          </button>
          <button
            className="quick-btn"
            onClick={() => setCommandInput("/agents")}
          >
            /agents
          </button>
        </div>
      </section>

      {/* フッター */}
      <footer className="remote-footer">
        <p>
          Remote Interface v1.0 - WebSocket Gateway Client
        </p>
      </footer>
    </div>
  );
};

export default RemoteInterface;
