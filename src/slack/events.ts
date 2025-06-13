import { decodeType, literal, record, string } from "typescript-json-decoder";

/** The initial handshake challenge sent by Slack to verify endpoint authenticity */
export type EndpointHandshake = decodeType<typeof decodeEndpointHandshake>;
export const decodeEndpointHandshake = record({
  token: string,
  challenge: string,
  type: literal("url_verification"),
});
