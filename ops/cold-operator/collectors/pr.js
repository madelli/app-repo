// ops/cold-operator/collectors/pr.js

import fs from "fs";
import fetch from "node-fetch";

/**
 * Cold Operator の Pull Request 状態収集ロジック
 */
export async function collectPRs() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));

  const prNumber = event.pull_request.number;
  const repo = process.env.GITHUB_REPOSITORY;
  const [owner, repoName] = repo.split("/");

  const token = process.env.GITHUB_TOKEN;

  const diffUrl = `https://api.github.com/repos/${owner}/${repoName}/pulls/${prNumber}/files`;

  const res = await fetch(diffUrl, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  const files = await res.json();

  const parsed = files.map((f) => {
    return {
      filename: f.filename,
      additions: f.additions,
      deletions: f.deletions,
      changes: f.changes,
      status: f.status,
      impactArea: detectImpactArea(f.filename)
    };
  });

  return {
    prs: [
      {
        id: prNumber,
        diff: {
          files: parsed.length,
          linesChanged: parsed.reduce((sum, f) => sum + f.changes, 0),
          impactArea: summarizeImpact(parsed)
        },
        security: { risk: "none" },
        gitops: detectGitOpsChanges(parsed)
      }
    ]
  };
}

function detectImpactArea(filename) {
  if (filename.startsWith("api/")) return "API";
  if (filename.startsWith("frontend/")) return "Frontend";
  if (filename.startsWith("infra/")) return "Infra";
  if (filename.includes("deployment") || filename.includes("manifest"))
    return "GitOps";
  return "Other";
}

function summarizeImpact(files) {
  const areas = new Set(files.map((f) => f.impactArea));
  if (areas.size === 1) return [...areas][0];
  return "Multiple";
}

function detectGitOpsChanges(files) {
  const hasManifest = files.some((f) =>
    f.filename.includes("deployment") ||
    f.filename.includes("service") ||
    f.filename.includes("manifest") ||
    f.filename.includes("k8s")
  );

  return {
    hasChanges: hasManifest,
    affectsDeployment: hasManifest
  };
}
