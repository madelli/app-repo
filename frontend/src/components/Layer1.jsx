/**
 * Layer 1 - Ritualistic Entry Portal
 *
 * Entry point to Cold Operator system.
 * Features ceremonial design with local-only SHA-256 authentication.
 * No external API calls, scripts, or WebSocket connections.
 */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPassword, setAuthenticated, isAuthenticated } from "../utils/auth";
import "./Layer1.css";

const Layer1 = () => {
  const navigate = useNavigate();
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation states
  const [bgVisible, setBgVisible] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [formVisible, setFormVisible] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/layer2", { replace: true });
    }
  }, [navigate]);

  // Staged fade-in animation
  useEffect(() => {
    const bgTimer = setTimeout(() => setBgVisible(true), 100);
    const panelTimer = setTimeout(() => setPanelVisible(true), 400);
    const formTimer = setTimeout(() => setFormVisible(true), 700);

    return () => {
      clearTimeout(bgTimer);
      clearTimeout(panelTimer);
      clearTimeout(formTimer);
    };
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Small delay to prevent brute force
    await new Promise((resolve) => setTimeout(resolve, 300));

    const isValid = await verifyPassword(accessCode);

    if (isValid) {
      setAuthenticated();
      navigate("/layer2", { replace: true });
    } else {
      setError("Access denied");
      setAccessCode("");
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleChange = (e) => {
    setAccessCode(e.target.value);
    if (error) setError("");
  };

  return (
    <div className={`layer1-container ${bgVisible ? "visible" : ""}`}>
      {/* Background elements */}
      <div className="l1-bg-grid" />
      <div className="l1-bg-glow" />

      {/* Corner markers */}
      <div className="l1-corner top-left" />
      <div className="l1-corner top-right" />
      <div className="l1-corner bottom-left" />
      <div className="l1-corner bottom-right" />

      {/* Central panel */}
      <div className={`l1-panel ${panelVisible ? "visible" : ""}`}>
        {/* Panel frame */}
        <div className="l1-panel-frame">
          <div className="l1-frame-line top" />
          <div className="l1-frame-line right" />
          <div className="l1-frame-line bottom" />
          <div className="l1-frame-line left" />
        </div>

        {/* Panel content */}
        <div className="l1-panel-content">
          {/* Header */}
          <div className="l1-header">
            <div className="l1-icon-wrapper">
              <span className="l1-icon">◇</span>
            </div>
            <h1 className="l1-title">Cold Operator</h1>
            <p className="l1-subtitle">第一層</p>
          </div>

          {/* Divider */}
          <div className="l1-divider">
            <span className="l1-divider-symbol">◈</span>
          </div>

          {/* Description */}
          <p className="l1-description">
            儀式的入口層
            <br />
            アクセスコードを入力してください
          </p>

          {/* Login form */}
          <form
            onSubmit={handleSubmit}
            className={`l1-form ${formVisible ? "visible" : ""}`}
          >
            <div className="l1-input-wrapper">
              <label htmlFor="accessCode" className="l1-label">
                Access Code
              </label>
              <input
                id="accessCode"
                type="password"
                value={accessCode}
                onChange={handleChange}
                className="l1-input"
                placeholder="Enter access code"
                autoComplete="off"
                autoFocus
                disabled={isLoading}
                required
              />
            </div>

            {error && (
              <div className="l1-error">
                <span className="l1-error-icon">△</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="l1-submit"
              disabled={isLoading || !accessCode.trim()}
            >
              {isLoading ? (
                <span className="l1-loading">Verifying...</span>
              ) : (
                <>
                  <span>Enter</span>
                  <span className="l1-submit-arrow">→</span>
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="l1-footer">
            <span>Authorized access only</span>
          </div>
        </div>
      </div>

      {/* Layer indicator */}
      <div className="l1-indicator">
        <span>L1</span>
      </div>
    </div>
  );
};

export default Layer1;
