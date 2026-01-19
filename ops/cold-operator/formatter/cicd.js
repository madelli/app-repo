// ops/cold-operator/formatter/cicd.js

/**
 * CI/CD の生データを Cold Operator 標準フォーマットに整形する
 * @param {Object} state - collectCICDState() が返すデータ
 * @returns {Object} formatted - 整形済みデータ
 */
export function formatCICDState(state) {
  if (!state || !state.workflows) {
    return {
      summary: "No workflow data available",
      workflows: []
    };
  }

  const workflows = state.workflows.map(wf => ({
    id: wf.id,
    name: wf.name,
    status: wf.status,
    conclusion: wf.conclusion,
    url: wf.html_url,
    started_at: wf.run_started_at,
    duration: wf.run_duration_seconds,
    status_label: formatStatusLabel(wf.status, wf.conclusion),
    duration_label: wf.run_duration_seconds
      ? `${wf.run_duration_seconds}s`
      : "N/A"
  }));

  return {
    summary: generateSummary(workflows),
    workflows
  };
}

function formatStatusLabel(status, conclusion) {
  if (status === "queued") return "🟡 キュー待ち";
  if (status === "in_progress") return "🔵 実行中";

  if (status === "completed") {
    if (conclusion === "success") return "🟢 成功";
    if (conclusion === "failure") return "🔴 失敗";
    if (conclusion === "cancelled") return "⚪ キャンセル";
  }

  return "⚫ 不明";
}

function generateSummary(workflows) {
  if (workflows.length === 0) return "No workflow runs detected";

  const latest = workflows[0];
  return `Latest workflow "${latest.name}" is ${latest.status_label} (${latest.duration_label})`;
}
