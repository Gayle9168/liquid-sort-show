import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path"; import { fileURLToPath } from "url"; const __dirname = path.dirname(fileURLToPath(import.meta.url));
const bundled = await bundle({ entryPoint: path.resolve(__dirname, "../src/index.ts"), webpackOverride: (c) => c });
const browser = await openBrowser("chrome", {
  browserExecutable: "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const composition = await selectComposition({ serveUrl: bundled, id: "quick", puppeteerInstance: browser });
const frames = [130, 350, 600, 900, 1100];
for (const f of frames) {
  await renderStill({ composition, serveUrl: bundled, output: `/tmp/qs_${f}.png`, frame: f, puppeteerInstance: browser });
  console.log("frame", f);
}
await browser.close({ silent: false });
