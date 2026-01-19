// ops/cold-operator/core/analyzer.js

// Priority: "high" | "medium" | "low"
// type: "pr" | "gitops" | "cicd" | "metrics"

export function analyzePRs(prs) {
  const actions = [];

  for (const pr of prs) {
    const diff = pr.diff || {};
    const security = pr.security || {};
    const gitops = pr.gitops || {};

    let priority = "low";

    if (gitops.affectsDeployment) {
      priority = "high";
    } else if (security.risk === "high") {
      priority = "high";
    } else if ((diff.linesChanged || 0) > 50) {
      priority = "high";
    } else if ((diff.linesChanged || 0) > 10) {
      priority = "medium";
    }

    if (priority !== "low") {
      actions.push({
        type: "pr",
        priority,
        target: `PR #${pr.id}`,
        impactArea: diff.impactArea || "Unknown",
        reason: buildPRReason(diff, security, gitops),
        recommendedAction: "レビューを実施"
      });
    }
  }

  return actions;
}

export function analyzeGitOps(gitops) {
  if (!gitops || !gitops.syncStatus) {
    return [];
  }

  if (gitops.syncStatus === "Synced") {
    return [];
  }

  const reasonBase =
    gitops.syncStatus === "OutOfSync"
      ? "GitOps の同期が遅延"
      : `GitOps 状態：${gitops.syncStatus}`;

  return [
    {
      type: "gitops",
      priority: "high",
      target: gitops.appName || "GitOps",
      reason: reasonBase,
      recommendedAction: "差分の確認"
    }
  ];
}

function analyzeCICD(cicd) {
  if (!cicd || !Array.isArray(cicd.workflows)) {
    return [];
  }

  const actions = [];

  for (const wf of cicd.workflows) {
    if (wf.conclusion === "success") continue;

    let priority = "medium";

    if (wf.name && /deploy/i.test(wf.name)) {
      priority = "high";
    }

    actions.push({
      type: "cicd",
      priority,
      target: wf.name || "CI/CD",
      reason: buildCICDReason(wf),
      recommendedAction: "ログの確認"
    });
  }

  return actions;
}

export function analyzeMetrics(metrics) {
  if (!metrics || !metrics.api) {
    return [];
  }

  const actions = [];
  const api = metrics.api;

  if (api.errorRate != null && api.errorRate > 0.05) {
    actions.push({
      type: "metrics",
      priority: "high",
      target: "API",
      reason: "API エラー率が閾値を超過",
      recommendedAction: "ログの確認"
    });
  }

  if (api.latencyP95 != null && api.latencyP95 > 300) {
    actions.push({
      type: "metrics",
      priority: "medium",
      target: "API",
      reason: "API レイテンシが高い",
      recommendedAction: "原因の調査"
    });
  }

  return actions;
}

// ───────────────────────────────
// 内部ヘルパー
// ───────────────────────────────

function buildPRReason(diff, security, gitops) {
  const parts = [];

  if (diff.impactArea) {
    parts.push(`影響範囲：${diff.impactArea}`);
  }

  if (diff.linesChanged != null) {
    parts.push(`変更行数：${diff.linesChanged}`);
  }

  if (gitops.affectsDeployment) {
    parts.push("GitOps manifest に変更あり");
  }

  if (security.risk && security.risk !== "none") {
    parts.push(`セキュリティリスク：${security.risk}`);
  }

  if (parts.length === 0) {
    return "PR に変更あり";
  }

  return parts.join(" / ");
}

function buildCICDReason(wf) {
  const parts = [];

  if (wf.conclusion) {
    parts.push(`結果：${wf.conclusion}`);
  }

  if (wf.duration != null) {
    parts.push(`実行時間：${wf.duration}s`);
  }

  if (wf.url || wf.html_url) {
    parts.push(`詳細：${wf.url || wf.html_url}`);
  }

  if (parts.length === 0) {
    return "CI/CD 実行に問題あり";
  }

  return parts.join(" / ");
}

// ───────────────────────────────
// Export 修正（GitHub Actions 対応）
// ───────────────────────────────

export { analyzeCICD };
