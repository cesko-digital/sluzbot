import {
  AppMention,
  decodeAppMentionEvent,
  decodeEndpointHandshake,
  decodeEventCallback,
} from "@/src/slack/events";
import { waitUntil } from "@vercel/functions";
import { WebClient } from "@slack/web-api";
import { NextRequest } from "next/server";
import OpenAI from "openai";
import { union } from "typescript-json-decoder";

export async function POST(request: NextRequest): Promise<Response> {
  const decodeIncomingMessage = union(
    decodeEndpointHandshake,
    decodeEventCallback(decodeAppMentionEvent)
  );
  try {
    const msg = decodeIncomingMessage(await request.json());
    if (msg.token !== process.env.SLACK_LEGACY_VERIFICATION_TOKEN) {
      return new Response("Verification token does not match", { status: 403 });
    }
    switch (msg.type) {
      case "url_verification":
        return new Response(msg.challenge, { status: 200 });
      case "event_callback":
        // Return a response to Slack immediately, but also wait
        // for the chat response to finish before exiting
        waitUntil(respondToMention(msg.event));
        return new Response("OK, thanks!", { status: 200 });
    }
  } catch {
    return new Response("Cannot decode handshake event", { status: 400 });
  }
}

async function respondToMention(mention: AppMention): Promise<void> {
  const openai = new OpenAI({ apiKey: process.env.OPEN_AI_API_KEY });
  const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

  const spinnerReaction = "hourglass_flowing_sand";

  // Start spinner
  await slack.reactions.add({
    name: spinnerReaction,
    channel: mention.channel,
    timestamp: mention.ts,
  });

  const response = await openai.responses.create({
    model: "gpt-4.1",
    input: mention.text,
  });

  // Stop spinner
  await slack.reactions.remove({
    name: spinnerReaction,
    channel: mention.channel,
    timestamp: mention.ts,
  });

  if (response.error) {
    await slack.chat.postMessage({
      channel: mention.channel,
      thread_ts: mention.event_ts,
      text: response.error.message,
    });
    return;
  }

  await slack.chat.postMessage({
    channel: mention.channel,
    thread_ts: mention.event_ts,
    text: response.output_text,
  });
}
