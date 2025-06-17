import assert from "node:assert";
import test from "node:test";
import { decodeSession, Session } from "./session";

test("Decode session", () => {
  const json = {
    "ID": "recAqHBmnktRtTyxn",
    "Session ID": "1749888537.718379",
    "Last Response ID": "resp_684d2e7f430481999449ec4480275d6905d29d8caf670602",
    "Last updated": "2025-06-17T11:50:17.000Z",
    "Model": ["recDdQrpb7l8F7esJ"],
    "LLM": ["gpt-4.1"],
    "Prompt": ["Your name is Službot, you are…"],
    "Vector Store ID": ["foo"],
  };
  assert.deepEqual(decodeSession(json), <Session>{
    databaseId: "recAqHBmnktRtTyxn",
    sessionId: "1749888537.718379",
    lastResponseId: "resp_684d2e7f430481999449ec4480275d6905d29d8caf670602",
    model: "recDdQrpb7l8F7esJ",
    prompt: "Your name is Službot, you are…",
    vectorStoreId: "foo",
    llm: "gpt-4.1",
  });
});
