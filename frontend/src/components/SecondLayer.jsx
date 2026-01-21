/**
 * Layer 2 - Central Command Panel
 *
 * Ritualistic interface serving as the gateway to deeper layers.
 * Features geometric design, cold color palette, and fade-in animations.
 * Now enhanced with 3D ritualistic UI using React Three Fiber.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./SecondLayer.css";
import RitualCore from "./RitualCore";

const SecondLayer = () => {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [panelReady, setPanelReady] = useState(false);

  // Staged fade-in animation
  useEffect(() => {
    // First stage: background fade
    const bgTimer = setTimeout(() => setIsVisible(true), 100);
    // Second stage: panel reveal
    const panelTimer = setTimeout(() => setPanelReady(true), 600);

    return () => {
      clearTimeout(bgTimer);
      clearTimeout(panelTimer);
    };
  }, []);

  // Navigation handlers
  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className={`layer2-container ${isVisible ? "visible" : ""}`}>
      {/* Geometric background elements */}
      <div className="bg-grid" />
      <div className="bg-glow" />

      {/* 3D Ritualistic Core - Cold Operator Core */}
      <div className={`ritual-scene ${panelReady ? "active" : ""}`}>
        <RitualCore
          autoRotateCamera={true}
          enableControls={false}
        />
      </div>

      {/* Corner markers */}
      <div className="corner-marker top-left" />
      <div className="corner-marker top-right" />
      <div className="corner-marker bottom-left" />
      <div className="corner-marker bottom-right" />

      {/* Central command panel */}
      <div className={`central-panel ${panelReady ? "ready" : ""}`}>
        {/* Panel border frame */}
        <div className="panel-frame">
          <div className="frame-line top" />
          <div className="frame-line right" />
          <div className="frame-line bottom" />
          <div className="frame-line left" />
        </div>

        {/* Panel content */}
        <div className="panel-content">
          {/* Header section */}
          <div className="panel-header">
            <div className="status-indicator">
              <span className="indicator-dot" />
              <span className="indicator-text">ACTIVE</span>
            </div>
            <h1 className="panel-title">Central Command</h1>
            <p className="panel-subtitle">
              Operational intelligence interface initialized.
              <br />
              Select destination layer.
            </p>
          </div>

          {/* Divider */}
          <div className="panel-divider">
            <span className="divider-symbol">◇</span>
          </div>

          {/* Navigation buttons */}
          <div className="panel-actions">
            <button
              className="action-button console"
              onClick={() => handleNavigate("/console")}
            >
              <span className="button-icon">▣</span>
              <span className="button-label">Agent Console</span>
              <span className="button-sublabel">Layer 3</span>
            </button>

            <button
              className="action-button core"
              onClick={() => handleNavigate("/core")}
            >
              <span className="button-icon">◈</span>
              <span className="button-label">System Core</span>
              <span className="button-sublabel">Layer 4</span>
            </button>

            <button
              className="action-button remote"
              onClick={() => handleNavigate("/remote")}
            >
              <span className="button-icon">◎</span>
              <span className="button-label">Remote Interface</span>
              <span className="button-sublabel">Layer 5</span>
            </button>
          </div>

          {/* Footer */}
          <div className="panel-footer">
            <span className="footer-text">Session active</span>
            <span className="footer-separator">|</span>
            <span className="footer-text">Secure connection</span>
          </div>
        </div>
      </div>

      {/* Layer indicator */}
      <div className="layer-indicator">
        <span>L2</span>
      </div>
    </div>
  );
};

export default SecondLayer;
