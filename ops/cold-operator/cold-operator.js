// cold-operator.js

import { collectSystemState } from "./collectors/index.js";
import { decideNextActions } from "./core/index.js";
import { formatColdOperatorComment } from "./formatters/cold-operator-style.js";
import fs from "fs";

async function main() {
  try {
    const systemState = await collectSystemState();
    const result = decideNextActions(systemState);
    const comment = formatColdOperatorComment(result.navigator);

    fs.writeFileSync(
      "cold-operator-output.json",
      JSON.stringify({ comment }, null, 2)
    );

    console.log("Cold Operator completed. Output saved.");
  } catch (err) {
    console.error("Cold Operator failed:", err);
    fs.writeFileSync(
      "cold-operator-output.json",
      JSON.stringify({ comment: "解析失敗。Cold Operator に異常が発生しました。" }, null, 2)
    );
  }
}

main();
