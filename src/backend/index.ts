import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { env } from "~/utils/env";

const app = new Hono();
app.get("/", (c) => c.text("Health Test"));

const url = `${env.BACKEND_URI}:${env.BACKEND_PORT}`;

console.log("Server is running on " + url);

serve({ fetch: app.fetch, port: env.BACKEND_PORT });

