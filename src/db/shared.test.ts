import assert from "node:assert";
import test from "node:test";
import { decodeLookupField, decodeFirst } from "./shared";
import { number } from "typescript-json-decoder";

test("Decode lookup field", () => {
  assert.strictEqual(decodeLookupField(["foo", "bar"]), "foo");
  assert.strictEqual(decodeLookupField([]), undefined);
  assert.strictEqual(decodeLookupField(undefined), undefined);
});

test("Decode first item", () => {
  assert.strictEqual(decodeFirst(number)([1, 2]), 1);
  assert.strictEqual(decodeFirst(number)([]), undefined);
});
