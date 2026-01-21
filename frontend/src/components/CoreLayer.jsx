/**
 * Cold Operator - Core Layer (第4層：深層)
 *
 * Cold Operator の中枢。
 * すべての層を統べ、システム全体の状態を可視化する。
 *
 * ここに至る者は、全層を見渡す権限を持つ。
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CoreLayer.css";

// システムステータス（プレースホルダー）
const LAYER_STATUS = [
  { id: 1, name: "Surface", path: "/", status: "ONLINE", type: "表層" },
  { id: 2, name: "Ritual", path: "/layer2", status: "ONLINE", type: "準裏層" },
  { id: 3, name: "Console", path: "/console", status: "ONLINE", type: "裏層" },
  { id: 4, name: "Core", path: "/core", status: "ACTIVE", type: "深層" },
  { id: 5, name: "Remote", path: "/remote", status: "STANDBY", type: "外界接続" }
];

const CoreLayer = () => {
  const navigate = useNavigate();
  const [systemLog, setSystemLog] = useState([
    { time: "INIT", message: "Cold Operator Core initialized." },
    { time: "BOOT", message: "All layers connected." },
    { time: "SYNC", message: "Persona agents synchronized." }
  ]);

  // 層への移動
  const navigateToLayer = (path) => {
    navigate(path);
  };

  // システムログに追記
  const addLog = (message) => {
    const time = new Date().toLocaleTimeString();
    setSystemLog((prev) => [...prev, { time, message }]);
  };

  return (
    <div className="core-container">
      {/* 中枢ヘッダー */}
      <header className="core-header">
        <div className="core-title">
          <h1>COLD OPERATOR CORE</h1>
          <span className="core-subtitle">Layer 4 - 深層中枢</span>
        </div>
        <div className="core-status-indicator">
          <span className="pulse"></span>
          <span>SYSTEM ACTIVE</span>
        </div>
      </header>

      {/* 層マップ */}
      <section className="layer-map">
        <h2>Layer Architecture</h2>
        <div className="layer-grid">
          {LAYER_STATUS.map((layer) => (
            <div
              key={layer.id}
              className={`layer-card ${layer.status.toLowerCase()}`}
              onClick={() => navigateToLayer(layer.path)}
            >
              <div className="layer-number">L{layer.id}</div>
              <div className="layer-name">{layer.name}</div>
              <div className="layer-type">{layer.type}</div>
              <div className={`layer-status-badge ${layer.status.toLowerCase()}`}>
                {layer.status}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* システムモニター */}
      <section className="system-monitor">
        <h2>System Monitor</h2>
        <div className="monitor-grid">
          <div className="monitor-card">
            <div className="monitor-label">Active Layers</div>
            <div className="monitor-value">5 / 5</div>
          </div>
          <div className="monitor-card">
            <div className="monitor-label">Agents Online</div>
            <div className="monitor-value">3</div>
          </div>
          <div className="monitor-card">
            <div className="monitor-label">Remote Connections</div>
            <div className="monitor-value">0</div>
          </div>
          <div className="monitor-card">
            <div className="monitor-label">Rituals Completed</div>
            <div className="monitor-value">--</div>
          </div>
        </div>
      </section>

      {/* システムログ */}
      <section className="system-log">
        <h2>System Log</h2>
        <div className="log-container">
          {systemLog.map((entry, idx) => (
            <div key={idx} className="log-line">
              <span className="log-timestamp">[{entry.time}]</span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 操作パネル */}
      <section className="control-panel">
        <h2>Control Panel</h2>
        <div className="control-buttons">
          <button
            className="control-btn"
            onClick={() => addLog("Layer scan initiated.")}
          >
            Scan Layers
          </button>
          <button
            className="control-btn"
            onClick={() => addLog("Agent sync requested.")}
          >
            Sync Agents
          </button>
          <button
            className="control-btn remote"
            onClick={() => navigateToLayer("/remote")}
          >
            Open Remote Interface
          </button>
        </div>
      </section>
    </div>
  );
};

export default CoreLayer;
