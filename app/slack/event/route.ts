import { decodeEndpointHandshake } from "@/src/slack/events";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const msg = decodeEndpointHandshake(await request.json());
    return new Response(msg.challenge, { status: 200 });
  } catch {
    return new Response("Cannot decode handshake event", { status: 400 });
  }
}
