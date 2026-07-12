import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { attachOnlineRelay } from "./server/onlineRelay.mjs";

const port = Number(process.env.PORT || 8787);
const relayOnly = process.argv.includes("--relay-only");
const dist = join(process.cwd(), "dist");
const mime = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".svg": "image/svg+xml",
  ".wav": "audio/wav", ".mp3": "audio/mpeg",
};

const server = createServer(async (req, res) => {
  if (relayOnly) {
    res.writeHead(200, { "content-type": "application/json", "access-control-allow-origin": "*" });
    res.end(JSON.stringify({ ok: true, service: "romaco-online-relay" }));
    return;
  }
  try {
    const rawPath = decodeURIComponent(new URL(req.url || "/", "http://localhost").pathname);
    const safePath = normalize(rawPath).replace(/^(\.\.(\/|\\|$))+/, "");
    let file = join(dist, safePath === "/" ? "index.html" : safePath);
    try {
      if ((await stat(file)).isDirectory()) file = join(file, "index.html");
    } catch {
      file = join(dist, "index.html");
    }
    const body = await readFile(file);
    res.writeHead(200, { "content-type": mime[extname(file)] || "application/octet-stream" });
    res.end(body);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});

attachOnlineRelay(server);

server.listen(port, () => console.log(`Romaco online server: http://localhost:${port}`));
