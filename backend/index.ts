import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { env } from "~/api";
import { setupCrons } from "./cron";
import { vpsRoute } from "./routes/vps";
import { mailboxRoute } from "./routes/mailbox";
// import { runBashCommands } from "./routes/mailbox.helpers";
setupCrons();

const app = new Hono();
app.get("/", (c) => c.text("hello worldd"));

app.route("/vps", vpsRoute);
app.route("/mailbox", mailboxRoute);

const url = `${env.BACKEND_URI}:${env.BACKEND_PORT}`;

// await runBashCommands({
//   host: "45.8.150.40",
//   port: 22,
//   password: "0df4ebde4bc24c13a51c7beb84a102d5",
//   username: "admin",
// });
console.log("Server is running on " + url);

serve({ fetch: app.fetch, port: env.BACKEND_PORT });

// export default {
//   fetch: app.fetch,
//   port: env.BACKEND_PORT,
// }
