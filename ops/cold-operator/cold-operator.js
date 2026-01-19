// ops/cold-operator/cold-operator.js

import fs from "fs";
import { collectPRs } from "./collectors/pr.js";
import { collectGitOps } from "./collectors/gitops.js";
import { collectCICD } from "./collectors/cicd.js";
import { collectMetrics } from "./collectors/metrics.js";

import { decideNextActions } from "./core/index.js";
import { formatComment } from "./formatter/index.js";
import { buildColdOperatorState } from "./core/state.js";

async function main() {
  console.log("Cold Operator: Starting analysis...");

  // --- Collector Phase ---
  const pullRequests = await collectPRs();
  const gitops = await collectGitOps();
  const cicd = await collectCICD();
  const metrics = await collectMetrics();

  const systemState = {
    pullRequests,
    gitops,
    cicd,
    metrics
  };

  // --- Analyzer + Navigator Phase ---
  const result = decideNextActions(systemState);

  // --- Formatter Phase ---
  const comment = formatComment(result);

  // --- State Model Output ---
  const stateModel = buildColdOperatorState(systemState);

  // --- Output JSON ---
  const output = {
    comment,
    raw: result.raw,
    navigator: result.navigator
  };

  fs.writeFileSync("cold-operator-output.json", JSON.stringify(output, null, 2));

  console.log("Cold Operator: Analysis complete.");
}

main().catch((err) => {
  console.error("Cold Operator failed:", err);
  process.exit(1);
});
