import { resolve } from "path";

import { defineConfig, loadEnv } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const { BACKEND_IP } = env;

  const isDev = mode === "development";
  const isTest = mode === "test";

  return {
    define: {
      __API_ROOT__: JSON.stringify(isTest ? BACKEND_IP : "/kaith"),
    },
    build: {
      lib: {
        entry: resolve(__dirname, "src/index.ts"),
        name: "@leapcell/leapcell-js",
        fileName: "index",
      },
      rollupOptions: {
        external: ["axios", "form-data"],
      },
      emptyOutDir: !isDev,
    },
    plugins: [dts({ insertTypesEntry: true })],
    server: {
      proxy: {},
    },
  };
});
