import { redis } from "@/lib/redis/redis";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Collect Store Id from params
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return new Response("Missing store ID", { status: 400 });
    }

    // Define channel name
    const channel = `pos:updates:${storeId}`;

    // Define a stream for logging in data
    let subscribe: any;
    const stream = new ReadableStream({
      // We define a controller at the start responsible for creating a new line to subscribe to the channel
      async start(controller) {
        subscribe = redis.duplicate();
        await subscribe.connect();
        // Subscribe to the channel name
        // On every incomming message stream it, *-- Defined as JSON in publisher
        await subscribe.subscribe(`${channel}`, (message: string) => {
          controller.enqueue(`data: ${message}\n\n`);
        });
      },

      // Anytime the connection closes or the tab is closed we tear this subscriber down
      async cancel() {
        if (subscribe) {
          await subscribe.quit();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.log(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
