// ops/cold-operator/formatter/index.js

import { formatColdOperatorComment } from "./style.js";

/**
 * Cold Operator のコメント生成エントリ
 * @param {Object} result - decideNextActions() の返却結果
 * @returns {string} comment - PR に投稿するコメント本文
 */
export function formatComment(result) {
  return formatColdOperatorComment(result.navigator);
}
