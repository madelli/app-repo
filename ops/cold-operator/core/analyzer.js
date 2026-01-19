// analyzer.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 対象ディレクトリ（Cold Operatorのルート）
const targetDir = path.resolve(__dirname, '..');

// 解析結果を格納するオブジェクト
const analysis = {
  missingFiles: [],
  emptyDirs: [],
  summary: {},
};

// 再帰的にディレクトリを走査
function analyzeDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  if (entries.length === 0) {
    analysis.emptyDirs.push(dir);
    return;
  }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      analyzeDirectory(fullPath);
    } else if (entry.isFile()) {
      // ここで特定ファイルの存在チェックなども可能
      if (entry.name === 'README.md' && fs.statSync(fullPath).size === 0) {
        analysis.missingFiles.push(fullPath);
      }
    }
  }
}

// 実行関数
export function runAnalysis() {
  console.log('🔍 Cold Operator Analyzer: Starting analysis...');
  analyzeDirectory(targetDir);

  analysis.summary = {
    scannedAt: new Date().toISOString(),
    root: targetDir,
    totalMissingFiles: analysis.missingFiles.length,
    totalEmptyDirs: analysis.emptyDirs.length,
  };

  console.log('📊 Analysis Summary:', analysis.summary);
  console.log('📁 Empty Directories:', analysis.emptyDirs);
  console.log('❌ Missing Files:', analysis.missingFiles);

  return analysis;
}

// CLI実行対応
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runAnalysis();
}
