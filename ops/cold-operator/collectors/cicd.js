// ops/cold-operator/collectors/cicd.js

import fs from "fs";
import fetch from "node-fetch";

export async function collectCICDState() {
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));

  const prNumber = event.pull_request.number;
  const repo = process.env.GITHUB_REPOSITORY;
  const [owner, repoName] = repo.split("/");

  const token = process.env.GITHUB_TOKEN;

  // PR に紐づくワークフロー実行一覧を取得
  const url = `https://api.github.com/repos/${owner}/${repoName}/actions/runs?event=pull_request`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  const data = await res.json();

  if (!data.workflow_runs || data.workflow_runs.length === 0) {
    return { workflows: [] };
  }

  // 最新のワークフローだけを見る
  const latest = data.workflow_runs[0];

  return {
    workflows: [
      {
        id: latest.id,
        name: latest.name,
        status: latest.status,       // queued / in_progress / completed
        conclusion: latest.conclusion, // success / failure / cancelled
        html_url: latest.html_url,
        run_started_at: latest.run_started_at,
        run_duration_seconds: calculateDuration(latest)
      }
    ]
  };
}

// 実行時間を計算
function calculateDuration(run) {
  if (!run.run_started_at || !run.updated_at) return null;

  const start = new Date(run.run_started_at);
  const end = new Date(run.updated_at);

  return Math.floor((end - start) / 1000);
}
