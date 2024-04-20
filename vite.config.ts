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
      presets: Boolean(env.VERCEL_URL) ? [vercelPreset()] : [],
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    exclude: ["oslo"],
  },
});
