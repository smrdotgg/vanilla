import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { vercelPreset } from "@vercel/remix/vite";
import { env } from "./app/api";

import("./app/api");

installGlobals();

export default defineConfig({
  plugins: [
    remix({
      // future: {
      //   unstable_singleFetch: true,
      // },
      presets: env.VERCEL_URL ? [vercelPreset()] : [],
    }),
    tsconfigPaths(),
  ],
  envPrefix: "PUBLIC_",
  optimizeDeps: {
    exclude: ["oslo", "firebase-admin"],
  },
});
