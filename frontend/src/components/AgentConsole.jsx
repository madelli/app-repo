/**
 * Cold Operator - Agent Console (第3層：裏層)
 *
 * AIエージェントの黒魔術コンソール。
 * ここでは人格エージェントたちが目覚め、
 * 運用知性として振る舞う。
 *
 * 「呼び出されし者よ、汝の名を告げよ」
 */
import React, { useState } from "react";
import "./AgentConsole.css";

// 人格エージェント定義
const AGENTS = {
  SHADOW: {
    name: "Shadow",
    title: "影の執行者",
    description: "静かに監視し、必要な時にのみ動く。"
  },
  ORACLE: {
    name: "Oracle",
    title: "予見者",
    description: "ログを読み解き、未来の障害を予測する。"
  },
  SENTINEL: {
    name: "Sentinel",
    title: "番人",
    description: "境界を守り、異常を検知する。"
  }
};

const AgentConsole = () => {
  const [activeAgent, setActiveAgent] = useState(null);
  const [commandLog, setCommandLog] = useState([]);
  const [inputCommand, setInputCommand] = useState("");

  // コマンド実行
  const executeCommand = () => {
    if (!inputCommand.trim()) return;

    const timestamp = new Date().toLocaleTimeString();
    const newEntry = {
      time: timestamp,
      command: inputCommand,
      agent: activeAgent?.name || "SYSTEM",
      response: processCommand(inputCommand)
    };

    setCommandLog((prev) => [...prev, newEntry]);
    setInputCommand("");
  };

  // コマンド処理（プレースホルダー実装）
  const processCommand = (cmd) => {
    const lower = cmd.toLowerCase();

    if (lower === "help") {
      return "Available: summon <agent>, status, layers, clear";
    }
    if (lower.startsWith("summon ")) {
      const agentKey = lower.replace("summon ", "").toUpperCase();
      if (AGENTS[agentKey]) {
        setActiveAgent(AGENTS[agentKey]);
        return `${AGENTS[agentKey].name} has awakened. "${AGENTS[agentKey].description}"`;
      }
      return "Unknown agent. Available: shadow, oracle, sentinel";
    }
    if (lower === "status") {
      return activeAgent
        ? `Active Agent: ${activeAgent.name} (${activeAgent.title})`
        : "No agent active. Use 'summon <agent>' to awaken one.";
    }
    if (lower === "layers") {
      return "Layer 1: Surface | Layer 2: Ritual | Layer 3: Console [YOU ARE HERE] | Layer 4: Core | Layer 5: Remote";
    }
    if (lower === "clear") {
      setCommandLog([]);
      return null;
    }

    return `Unknown command: ${cmd}. Type 'help' for available commands.`;
  };

  // Enter キーでコマンド実行
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      executeCommand();
    }
  };

  return (
    <div className="console-container">
      {/* ヘッダー */}
      <header className="console-header">
        <h1>Agent Console</h1>
        <span className="layer-badge">Layer 3 - 裏層</span>
      </header>

      {/* エージェント選択パネル */}
      <div className="agent-panel">
        <h2>Persona Agents</h2>
        <div className="agent-grid">
          {Object.entries(AGENTS).map(([key, agent]) => (
            <div
              key={key}
              className={`agent-card ${activeAgent?.name === agent.name ? "active" : ""}`}
              onClick={() => setActiveAgent(agent)}
            >
              <div className="agent-name">{agent.name}</div>
              <div className="agent-title">{agent.title}</div>
            </div>
          ))}
        </div>
        {activeAgent && (
          <div className="active-agent-info">
            <strong>{activeAgent.name}</strong>: {activeAgent.description}
          </div>
        )}
      </div>

      {/* コンソール出力 */}
      <div className="console-output">
        {commandLog.map((entry, idx) => (
          <div key={idx} className="log-entry">
            <span className="log-time">[{entry.time}]</span>
            <span className="log-agent">[{entry.agent}]</span>
            <span className="log-command">&gt; {entry.command}</span>
            {entry.response && (
              <div className="log-response">{entry.response}</div>
            )}
          </div>
        ))}
      </div>

      {/* コマンド入力 */}
      <div className="console-input-area">
        <span className="prompt-symbol">
          {activeAgent ? `${activeAgent.name.toLowerCase()}@cold:~$` : "system@cold:~$"}
        </span>
        <input
          type="text"
          className="console-input"
          value={inputCommand}
          onChange={(e) => setInputCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter command..."
          autoFocus
        />
        <button className="execute-btn" onClick={executeCommand}>
          Execute
        </button>
      </div>
    </div>
  );
};

export default AgentConsole;
