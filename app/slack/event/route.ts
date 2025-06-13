import {
  decodeAppMentionEvent,
  decodeEndpointHandshake,
  decodeEventCallback,
} from "@/src/slack/events";
import { WebClient } from "@slack/web-api";
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
        const mention = msg.event;
        const slack = new WebClient(process.env.SLACK_BOT_TOKEN);
        await slack.chat.postMessage({
          channel: mention.channel,
          thread_ts: mention.event_ts,
          text: "Jsem na příjmu, ale ještě nic neumím. Brzy!",
        });
        return new Response("OK, thanks!", { status: 200 });
    }
  } catch {
    return new Response("Cannot decode handshake event", { status: 400 });
  }
}
