import { createServer } from "node:http";
import { handleTravelRunRoute } from "./routes/travel-runs";

const host = process.env.HOST || "127.0.0.1";
const port = Number(process.env.PORT || 8787);

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || `${host}:${port}`}`);

  if (request.method === "GET" && url.pathname === "/api/health") {
    response.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }

  try {
    if (await handleTravelRunRoute(request, response, url)) return;
  } catch (error) {
    console.error("Travel API request failed", error);
    if (!response.headersSent) response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ message: "Внутренняя ошибка сервера." }));
    return;
  }

  response.writeHead(404, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify({ message: "Маршрут не найден." }));
});

server.listen(port, host, () => {
  console.log(`Travel API listening on http://${host}:${port}`);
});

