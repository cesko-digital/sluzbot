import assert from "node:assert";
import test from "node:test";
import { doesModelNeedVectorStoreUpdate } from "./model";

test("Vector store update detection", () => {
  assert.strictEqual(
    doesModelNeedVectorStoreUpdate({
      lastContextUpdate: new Date("2025-06-17T08:37:12.000Z"),
      lastVectorStoreUpdate: new Date("2025-06-18T07:53:00.000Z"),
    }),
    false
  );
  assert.strictEqual(
    doesModelNeedVectorStoreUpdate({
      lastContextUpdate: undefined,
      lastVectorStoreUpdate: undefined,
    }),
    true
  );
  assert.strictEqual(
    doesModelNeedVectorStoreUpdate({
      lastContextUpdate: undefined,
      lastVectorStoreUpdate: new Date("2025-06-17T08:37:12.000Z"),
    }),
    false
  );
  assert.strictEqual(
    doesModelNeedVectorStoreUpdate({
      lastContextUpdate: new Date("2025-06-18T07:53:00.000Z"),
      lastVectorStoreUpdate: new Date("2025-06-17T08:37:12.000Z"),
    }),
    true
  );
});
