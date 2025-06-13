import {
  DecoderFunction,
  decodeType,
  literal,
  record,
  string,
} from "typescript-json-decoder";

/** The initial handshake challenge sent by Slack to verify endpoint authenticity */
export type EndpointHandshake = decodeType<typeof decodeEndpointHandshake>;
export const decodeEndpointHandshake = record({
  token: string,
  challenge: string,
  type: literal("url_verification"),
});

/** A generic event callback with a customizable event decoder */
export type EventCallback = decodeType<typeof decodeEventCallback>;
export const decodeEventCallback = <Event>(
  decodeEvent: DecoderFunction<Event>
) =>
  record({
    token: string,
    team_id: string,
    api_app_id: string,
    type: literal("event_callback"),
    event: decodeEvent,
  });

/** https://api.slack.com/events/app_mention */
export const decodeAppMentionEvent = record({
  type: literal("app_mention"),
  user: string,
  text: string,
  ts: string,
  channel: string,
  event_ts: string,
});
