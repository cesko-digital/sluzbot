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
import {
  createSession,
  defaultModelId,
  getExistingSession,
  saveSession,
} from "@/src/db/session";
import { getModelById } from "@/src/db/model";

export async function POST(request: NextRequest): Promise<Response> {
  const decodeIncomingMessage = union(
    decodeEndpointHandshake,
    decodeEventCallback(decodeAppMentionEvent)
  );
  try {
    const msg = decodeIncomingMessage(await request.json());
    if (msg.token !== process.env.SLACK_LEGACY_VERIFICATION_TOKEN) {
      console.error("Slack verification token does not match, ignoring.");
      return new Response("Verification token does not match", { status: 403 });
    }
    switch (msg.type) {
      case "url_verification":
        console.log("Received Slack URL verification request.");
        return new Response(msg.challenge, { status: 200 });
      case "event_callback":
        const event = msg.event as AppMention;
        console.log(
          `Received Slack app mention event, time stamp ${event.ts}, thread time stamp ${event.thread_ts}.`
        );
        // Return a response to Slack immediately, but also wait
        // for the chat response to finish before exiting
        waitUntil(respondToMention(event));
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

  const stopSpinner = () =>
    slack.reactions.remove({
      name: spinnerReaction,
      channel: mention.channel,
      timestamp: mention.ts,
    });

  // Is this mention a part of an existing session?
  const session = mention.thread_ts
    ? await getExistingSession(mention.thread_ts)
    : null;

  if (session) {
    console.log(
      `Mention is a part of existing session ${session.sessionId}, last response ID ${session.lastResponseId}.`
    );
  } else {
    console.log(`Previous session for this mention not found.`);
  }

  // Read model config from DB
  const model = await getModelById(session?.model ?? defaultModelId);
  if (!model) {
    await stopSpinner();
    await slack.chat.postMessage({
      channel: mention.channel,
      thread_ts: mention.event_ts,
      text: "Failed to read model from the database, sorry. Blame zoul!",
    });
    return;
  }

  console.log(
    `Using model ${model.name}, LLM ${model.llm}, vector store ${model.vectorStoreId}.`
  );

  // Generate response according to model config
  const response = await openai.responses.create({
    model: model.llm,
    input: mention.text,
    instructions: model.prompt,
    previous_response_id: session?.lastResponseId,
    tools: model.vectorStoreId
      ? [
          {
            type: "file_search",
            vector_store_ids: [model.vectorStoreId],
          },
        ]
      : [],
  });

  // On error report to the thread and bail out early
  if (response.error) {
    await stopSpinner();
    await slack.chat.postMessage({
      channel: mention.channel,
      thread_ts: mention.event_ts,
      text: response.error.message,
    });
    return;
  }

  // Save session
  if (session) {
    console.log(`Updating last response ID for session to ${response.id}.`);
    await saveSession({ ...session, lastResponseId: response.id });
  } else {
    console.log(
      `Creating new session with initial response ID ${response.id}.`
    );
    await createSession({
      sessionId: mention.thread_ts ?? mention.ts,
      lastResponseId: response.id,
    });
  }

  await stopSpinner();
  await slack.chat.postMessage({
    channel: mention.channel,
    thread_ts: mention.event_ts,
    text: response.output_text,
  });
}
