import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { env } from "~/utils/env";
import { scheduleCrons } from "./setup_crons";

const app = new Hono();

const url = `${env.BACKEND_URI}:${env.BACKEND_PORT}`;

scheduleCrons();

console.log("Server is running on " + url);

serve({ fetch: app.fetch, port: env.BACKEND_PORT });
