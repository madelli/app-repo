// ops/cold-operator/core/navigator.js

// 優先度の並び順
const PRIORITY_ORDER = {
  high: 0,
  medium: 1,
  low: 2
};

// 種別の並び順（GitOps → CI/CD → PR → Metrics）
const TYPE_ORDER = {
  gitops: 0,
  cicd: 1,
  pr: 2,
  metrics: 3
};

// ─────────────────────────────
// 優先度ソート
// ─────────────────────────────
export function sortByPriority(actions) {
  return actions.sort((a, b) => {
    const p = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority];
    if (p !== 0) return p;

    const t = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
    if (t !== 0) return t;

    return 0;
  });
}

// ─────────────────────────────
// Navigator Summary（結論）
// ─────────────────────────────
export function buildSummary(sortedActions) {
  if (!sortedActions || sortedActions.length === 0) {
    return {
      summary: "次の操作は不要。",
      reason: "クリティカルな異常は検出されていません。",
      recommended_action: "監視を継続"
    };
  }

  const top = sortedActions[0];

  return {
    summary: "次の操作を推奨。",
    reason: top.reason,
    recommended_action: top.recommendedAction
  };
}

// ─────────────────────────────
// Navigator 全体の構造を生成
// ─────────────────────────────
export function buildNavigator(actions) {
  const sorted = sortByPriority(actions);
  const summary = buildSummary(sorted);

  return {
    summary,
    actions: sorted
  };
}
