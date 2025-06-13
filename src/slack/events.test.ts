import assert from "node:assert";
import test from "node:test";
import {
  decodeAppMentionEvent,
  decodeEndpointHandshake,
  decodeEventCallback,
} from "./events";
import { record } from "typescript-json-decoder";

test("Decode initial handshake", () => {
  const payload = {
    token: "Jhj5dZrVaK7ZwHHjRyZWjbDl",
    challenge: "3eZbrw1aBm2rZgRNFdxV2595E9CY3gmdALWMmHkvFXO7tYXAYM8P",
    type: "url_verification",
  };
  assert.deepEqual(decodeEndpointHandshake(payload), payload);
});

test("Decode event callback", () => {
  const payload = {
    token: "ZZZZZZWSxiZZZ2yIvs3peJ",
    team_id: "T123ABC456",
    api_app_id: "A123ABC456",
    event: {},
    type: "event_callback",
    event_id: "Ev123ABC456",
    event_time: 1515449522000016,
    authed_users: ["U0LAN0Z89"],
  };
  const decodeDummyEvent = decodeEventCallback(record({}));
  assert.deepEqual(decodeDummyEvent(payload), {
    token: "ZZZZZZWSxiZZZ2yIvs3peJ",
    team_id: "T123ABC456",
    api_app_id: "A123ABC456",
    type: "event_callback",
    event: {},
  });
});

test("Decode app mention event", () => {
  const payload = {
    type: "app_mention",
    user: "U061F7AUR",
    text: "<@U0LAN0Z89> is it everything a river should be?",
    ts: "1515449522.000016",
    channel: "C123ABC456",
    event_ts: "1515449522000016",
  };
  assert.deepEqual(decodeAppMentionEvent(payload), payload);
});
