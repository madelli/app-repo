// ops/cold-operator/core/state.js

import fs from "fs";
import path from "path";
import { formatCICDState } from "../formatter/index.js";
import { decideNextActions } from "./index.js";

/**
 * Cold Operator の状態モデルを構築し、PR コメント用の文章も生成する
 */
export function buildColdOperatorState(rawState) {
  // 1. formatter で整形
  const formatted = formatCICDState(rawState);

  // 2. analyzer + navigator で行動提案を生成
  const decisions = decideNextActions({
    cicd: formatted,
    pullRequests: rawState.pullRequests || [],
    gitops: rawState.gitops || {},
    metrics: rawState.metrics || {}
  });

  // 3. PR コメント用の文章を生成
  const comment = buildComment(decisions);

  // 4. 状態モデルを構築
  const model = {
    generated_at: new Date().toISOString(),
    cicd: formatted,
    decisions,
    comment, // ★ GitHub Actions が読む部分
    meta: {
      version: "1.0.0",
      operator: "Cold Operator",
      description: "運用知性の中枢が生成した状態モデル"
    }
  };

  // 5. outputs に保存
  const outputDir = path.resolve("ops/cold-operator/outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "state.json");
  fs.writeFileSync(outputPath, JSON.stringify(model, null, 2), "utf8");

  return model;
}

/**
 * PR コメント用の文章を生成
 */
function buildComment(decisions) {
  const { navigator } = decisions;

  if (!navigator || !navigator.nextAction) {
    return `
### 🧊 Cold Operator Report
特に対応が必要なアクションはありません。
引き続き監視を継続します。
    `.trim();
  }

  const a = navigator.nextAction;

  return `
### 🧊 Cold Operator Report

**最優先アクション**  
- 種別: \`${a.type}\`  
- 優先度: \`${a.priority}\`  
- 対象: **${a.target}**  
- 理由: ${a.reason}  
- 推奨操作: **${a.recommendedAction}**

---

**サマリー**  
${navigator.summary.summary}

Cold Operator が状況を監視し、次の行動を提案しました。
  `.trim();
}
