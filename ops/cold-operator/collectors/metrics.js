export function collectMetrics() {
  // 仮のメトリクスデータ（後で Prometheus や Datadog などと連携可能）
  return {
    cpu: "normal",
    memory: "stable",
    errors: 0
  };
}
