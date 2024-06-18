import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { env } from "~/api";
import { setupCrons } from "./cron";
import { vpsRoute } from "./routes/vps";
import { mailboxRoute, setupMailboxes } from "./routes/mailbox";
import("../app/api");
setupCrons();

const app = new Hono();
app.get("/", (c) => c.text("hello worldd"));

app.route("/vps", vpsRoute);
app.route("/mailbox", mailboxRoute);

const url = `${env.BACKEND_URI}:${env.BACKEND_PORT}`;

console.log("Server is running on " + url);


serve({ fetch: app.fetch, port: env.BACKEND_PORT });
