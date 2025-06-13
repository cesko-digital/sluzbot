import assert from "node:assert";
import test from "node:test";
import { decodeEndpointHandshake } from "./events";

test("Decode initial handshake", () => {
  const payload = {
    token: "Jhj5dZrVaK7ZwHHjRyZWjbDl",
    challenge: "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
    type: "url_verification",
  };
  assert.deepEqual(decodeEndpointHandshake(payload), payload);
});
