import assert from "node:assert/strict";
import test from "node:test";
import { extractOpenAIOutputText } from "../src/lib/openAIResponse.ts";

test("extracts Responses API text nested in the output array", () => {
  const payload = {
    id: "resp_test",
    object: "response",
    output: [{
      id: "msg_test",
      type: "message",
      role: "assistant",
      status: "completed",
      content: [{ type: "output_text", annotations: [], text: "complete report framing" }],
    }],
  };

  assert.equal(extractOpenAIOutputText(payload), "complete report framing");
});
