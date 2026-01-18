// ops/cold-operator/collectors/cicd.js

import fs from "fs";
import fetch from "node-fetch";

export async function collectCICDState() {
  // GitHub Actions が提供するイベント JSON のパス
  const eventPath = process.env.GITHUB_EVENT_PATH;
  const event = JSON.parse(fs.readFileSync(eventPath, "utf8"));

  // PR 番号（pull_request イベント時のみ存在）
  const prNumber = event.pull_request?.number;

  // リポジトリ情報
  const repo = process.env.GITHUB_REPOSITORY;
  const [owner, repoName] = repo.split("/");

  // GitHub API 認証トークン
  const token = process.env.GITHUB_TOKEN;

  // PR に紐づく workflow run を取得
  const url = `https://api.github.com/repos/${owner}/${repoName}/actions/runs?event=pull_request`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json"
    }
  });

  const data = await res.json();

  if (!data.workflow_runs) {
    return { workflows: [] };
  }

  // PR番号でフィルタリング（重要）
  const runs = data.workflow_runs.filter(run =>
    run.pull_requests?.some(pr => pr.number === prNumber)
  );

  if (runs.length === 0) {
    return { workflows: [] };
  }

  // 最新の workflow run を取得
  const latest = runs[0];

  return {
    workflows: [
      {
        id: latest.id,
        name: latest.name,
        status: latest.status,          // queued / in_progress / completed
        conclusion: latest.conclusion,  // success / failure / cancelled
        html_url: latest.html_url,
        run_started_at: latest.run_started_at,
        run_duration_seconds: calculateDuration(latest)
      }
    ]
  };
}

// 実行時間を計算（秒）
function calculateDuration(run) {
  if (!run.run_started_at || !run.updated_at) return null;

  const start = new Date(run.run_started_at);
  const end = new Date(run.updated_at);

  return Math.floor((end - start) / 1000);
}
