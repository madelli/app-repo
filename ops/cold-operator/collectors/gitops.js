// ops/cold-operator/collectors/gitops.js

import { execSync } from "child_process";

export async function collectGitOpsState() {
  try {
    // Flux の kustomization 状態を JSON で取得
    const output = execSync("flux get kustomizations -o json", {
      encoding: "utf8"
    });

    const data = JSON.parse(output);

    // ここでは最初の kustomization を対象にする（必要なら複数対応も可能）
    const ks = data.items?.[0];

    if (!ks) {
      return {
        syncStatus: "Unknown",
        diff: null
      };
    }

    const status = ks.status?.conditions?.find(
      (c) => c.type === "Ready"
    );

    const syncStatus = status?.status === "True" ? "Synced" : "OutOfSync";

    return {
      appName: ks.metadata.name,
      syncStatus,
      lastAppliedRevision: ks.status?.lastAppliedRevision || null,
      lastAttemptedRevision: ks.status?.lastAttemptedRevision || null,
      observedGeneration: ks.status?.observedGeneration || null,
      diff: {
        hasDiff: syncStatus === "OutOfSync"
      }
    };
  } catch (err) {
    return {
      syncStatus: "Error",
      error: err.message
    };
  }
}
