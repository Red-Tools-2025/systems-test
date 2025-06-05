import { redis } from "@/lib/redis/redis";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
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
    let heartbeat: any;
    const stream = new ReadableStream({
      // We define a controller at the start responsible for creating a new line to subscribe to the channel
      async start(controller) {
        subscribe = redis.duplicate();

        // Only connect if not already connected or connecting
        if (subscribe.status === "end" || subscribe.status === "close") {
          await subscribe.connect();
        } else if (subscribe.status === "connecting") {
          // Wait for connection to complete
          await new Promise((resolve, reject) => {
            subscribe.once("ready", resolve);
            subscribe.once("error", reject);
          });
        }
        // If status is "ready", do nothing

        await subscribe.subscribe(channel, (message: string) => {
          controller.enqueue(`data: ${message}\n\n`);
        });

        heartbeat = setInterval(() => {
          try {
            controller.enqueue("data: XXXX");
          } catch (err) {
            // This will now be rare, but you can log if needed
            console.warn("Tried to enqueue after close:", err);
          }
        }, 30000);
      },

      // Anytime the connection closes or the tab is closed we tear this subscriber down
      async cancel() {
        if (subscribe) {
          await subscribe.quit();
        }
        if (heartbeat) {
          clearInterval(heartbeat);
          heartbeat = null;
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "Content-Encoding": "none",
      },
    });
  } catch (err) {
    console.log(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
