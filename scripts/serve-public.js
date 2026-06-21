import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const publicRoot = resolve(
  fileURLToPath(new URL("../public", import.meta.url))
);
const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 4173);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".mp3": "audio/mpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp"
};

function getFilePath(requestUrl) {
  const url = new URL(requestUrl, `http://${host}:${port}`);
  const pathname = decodeURIComponent(url.pathname);
  const relativePath = pathname.endsWith("/")
    ? `${pathname}index.html`
    : pathname;
  const filePath = resolve(publicRoot, `.${relativePath}`);

  if (filePath !== publicRoot && !filePath.startsWith(`${publicRoot}${sep}`)) {
    return null;
  }

  return filePath;
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8",
    "Cache-Control": "no-store"
  });
  response.end(message);
}

const server = createServer(async (request, response) => {
  if (!request.url || request.method !== "GET") {
    sendText(response, 405, "Method Not Allowed");
    return;
  }

  const filePath = getFilePath(request.url);

  if (!filePath) {
    sendText(response, 403, "Forbidden");
    return;
  }

  try {
    const fileStats = await stat(filePath);

    if (!fileStats.isFile()) {
      sendText(response, 404, "Not Found");
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[extname(filePath)] || "application/octet-stream",
      "Content-Length": fileStats.size,
      "Cache-Control": "no-store"
    });

    createReadStream(filePath).pipe(response);
  } catch {
    sendText(response, 404, "Not Found");
  }
});

server.listen(port, host, () => {
  console.log(`Serving ${publicRoot}`);
  console.log(`Local: http://${host}:${port}/`);
});
