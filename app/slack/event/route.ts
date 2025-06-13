import {
  decodeAppMentionEvent,
  decodeEndpointHandshake,
  decodeEventCallback,
} from "@/src/slack/events";
import { NextRequest } from "next/server";
import { union } from "typescript-json-decoder";

export async function POST(request: NextRequest): Promise<Response> {
  const decodeIncomingMessage = union(
    decodeEndpointHandshake,
    decodeEventCallback(decodeAppMentionEvent)
  );
  try {
    const msg = decodeIncomingMessage(await request.json());
    switch (msg.type) {
      case "url_verification":
        return new Response(msg.challenge, { status: 200 });
      case "event_callback":
        console.log("Received new mention: ", msg.event.text);
        return new Response("OK, thanks!", { status: 200 });
    }
  } catch {
    return new Response("Cannot decode handshake event", { status: 400 });
  }
}
