// ops/cold-operator/core/index.js

import {
  analyzePRs,
  analyzeGitOps,
  analyzeCICD,
  analyzeMetrics
} from "./analyzer.js";

import { buildNavigator } from "./navigator.js";

/**
 * Cold Operator の意思決定ロジック
 * collectors → analyzer → navigator → decisions
 */
export function decideNextActions(systemState) {
  // Analyzer: 各領域の解析
  const prActions = analyzePRs(systemState.pullRequests || []);
  const gitopsActions = analyzeGitOps(systemState.gitops || {});
  const cicdActions = analyzeCICD(systemState.cicd || {});
  const metricsActions = analyzeMetrics(systemState.metrics || {});

  // 全アクションを統合
  const allActions = [
    ...prActions,
    ...gitopsActions,
    ...cicdActions,
    ...metricsActions
  ];

  // Navigator: 優先度ソート & サマリ生成
  const navigator = buildNavigator(allActions);

  return {
    navigator,
    raw: {
      prActions,
      gitopsActions,
      cicdActions,
      metricsActions
    }
  };
}
