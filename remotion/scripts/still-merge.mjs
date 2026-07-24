import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition, openBrowser } from "@remotion/renderer";
import path from "path";
const bundled = await bundle({ entryPoint: path.resolve("remotion/src/index.ts"), webpackOverride: (c) => c });
const browser = await openBrowser("chrome", {
  browserExecutable: "/bin/chromium",
  chromiumOptions: { args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"] },
  chromeMode: "chrome-for-testing",
});
const composition = await selectComposition({ serveUrl: bundled, id: "merge", puppeteerInstance: browser });
for (const f of [130, 400, 700, 950, 1100]) {
  await renderStill({ composition, serveUrl: bundled, output: `/tmp/ms_${f}.png`, frame: f, puppeteerInstance: browser });
  console.log("frame", f);
}
await browser.close({ silent: false });
