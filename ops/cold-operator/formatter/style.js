// ops/cold-operator/formatters/cold-operator-style.js

export function formatColdOperatorComment(navigator) {
  const header = renderHeader(navigator.summary);
  const details = renderDetails(navigator.actions);

  return `${header}\n${details}`;
}

// ─────────────────────────────
// Header（結論・理由・推奨操作）
// ─────────────────────────────
function renderHeader(summary) {
  return [
    "解析完了。",
    "",
    summary.summary,
    `理由：${summary.reason}`,
    `推奨操作：${summary.recommended_action}`,
    ""
  ].join("\n");
}

// ─────────────────────────────
// 詳細（全アクション一覧）
// ─────────────────────────────
function renderDetails(actions) {
  if (!actions || actions.length === 0) {
    return "詳細：異常なし。";
  }

  const lines = actions.map((a) => {
    return [
      `- ${a.target}`,
      `Priority: ${a.priority}`,
      `${a.reason}`,
      `Action: ${a.recommendedAction}`
    ].join(" | ");
  });

  return ["詳細：", ...lines].join("\n");
}
