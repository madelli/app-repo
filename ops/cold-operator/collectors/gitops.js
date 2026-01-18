// ops/cold-operator/collectors/gitops.js

import { execSync } from "child_process";

/**
 * Cold Operator の GitOps 状態収集ロジック
 */
export async function collectGitOps() {
  try {
    const output = execSync("flux get kustomizations -o json", {
      encoding: "utf8"
    });

    const data = JSON.parse(output);
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
