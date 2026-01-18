// ops/cold-operator/core/state.js

import fs from "fs";
import path from "path";
import { formatCICDState } from "../formatter/index.js";

export function buildColdOperatorState(rawState) {
  // 1. formatter で整形
  const formatted = formatCICDState(rawState);

  // 2. 状態モデルを構築
  const model = {
    generated_at: new Date().toISOString(),
    cicd: formatted,
    meta: {
      version: "1.0.0",
      operator: "Cold Operator",
      description: "運用知性の中枢が生成した CI/CD 状態モデル"
    }
  };

  // 3. outputs ディレクトリに保存
  const outputDir = path.resolve("ops/cold-operator/outputs");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, "state.json");
  fs.writeFileSync(outputPath, JSON.stringify(model, null, 2), "utf8");

  return model;
}
