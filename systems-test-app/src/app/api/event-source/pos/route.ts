import { NextRequest } from "next/server";
import { Redis } from "ioredis";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get("storeId");

    if (!storeId) {
      return new Response("Missing store ID", { status: 400 });
    }

    const channel = `pos:updates:${storeId}`;
    console.log(`Setting up SSE for channel: ${channel}`);

    let subscriber: Redis | null = null;
    let heartbeat: any;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Create a new Redis instance for subscription
          subscriber = new Redis({
            host: process.env.REDIS_HOST || "localhost",
            port: parseInt(process.env.REDIS_PORT || "6379"),
          });

          console.log(
            `Connecting new Redis subscriber for channel: ${channel}`
          );

          // Wait for connection
          await new Promise((resolve, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("Connection timeout")),
              10000
            );

            subscriber!.on("ready", () => {
              clearTimeout(timeout);
              console.log("Redis subscriber connected successfully");
              resolve(null);
            });

            subscriber!.on("error", (err) => {
              clearTimeout(timeout);
              console.error("Redis subscriber connection error:", err);
              reject(err);
            });
          });

          // Set up message handler
          subscriber.on(
            "message",
            (receivedChannel: string, message: string) => {
              console.log(`Received message on ${receivedChannel}:`, message);
              try {
                const data = `data: ${message}\n\n`;
                controller.enqueue(new TextEncoder().encode(data));
              } catch (error) {
                console.error("Error sending message to client:", error);
              }
            }
          );

          // Subscribe to the channel
          await subscriber.subscribe(channel);
          console.log(`Successfully subscribed to ${channel}`);

          // Send initial connection confirmation
          const initialMessage = JSON.stringify({
            type: "connection",
            message: `Connected to ${channel}`,
            timestamp: Date.now(),
          });
          controller.enqueue(
            new TextEncoder().encode(`data: ${initialMessage}\n\n`)
          );
        } catch (error) {
          console.error("Error setting up SSE stream:", error);
          controller.error(error);
        }
      },

      async cancel() {
        console.log(`🧹 Cleaning up SSE connection for ${channel}`);

        if (subscriber) {
          try {
            await subscriber.unsubscribe(channel);
            await subscriber.quit();
            console.log(` Successfully cleaned up subscriber for ${channel}`);
          } catch (error) {
            console.error("Error cleaning up subscriber:", error);
          }
        }
      },
    });

    // Handle client disconnect
    req.signal?.addEventListener("abort", async () => {
      console.log(`Client disconnected from ${channel}`);
      if (heartbeat) clearInterval(heartbeat);
      if (subscriber) {
        try {
          await subscriber.unsubscribe(channel);
          await subscriber.quit();
        } catch (error) {
          console.error("Error on client disconnect cleanup:", error);
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Cache-Control",
      },
    });
  } catch (err) {
    console.error("SSE endpoint error:", err);
    return new Response(`Internal Server Error: ${err}`, { status: 500 });
  }
}
