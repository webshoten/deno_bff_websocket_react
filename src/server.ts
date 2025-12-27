// server.ts
import { Hono } from "hono";
import { serveStatic } from "hono/deno";

const app = new Hono();

/**
 * WebSocket エンドポイント
 * - ここに audio_chunk などのプロトコルを乗せていく想定
 */
app.get("/ws", (c) => {
  const { socket, response } = Deno.upgradeWebSocket(c.req.raw);

  socket.onopen = () => {
    console.log("🔌 ws open");
    // 必要なら最初に何か送る
    // socket.send(JSON.stringify({ type: "welcome" }));
  };

  socket.onmessage = (e) => {
    console.log("📨 ws message:", e.data);

    // ひとまず echo（JSONならパースして分岐など）
    // TODO: ここに audio_chunk / audio_chunk_out の処理を実装していく
    socket.send(e.data);
  };

  socket.onclose = () => {
    console.log("🔌 ws close");
  };

  socket.onerror = (e) => {
    console.error("⚠️ ws error:", e);
  };

  return response;
});

/**
 * ヘルスチェック用
 */
app.get("/health", (c) => c.text("ok"));

/**
 * 静的ファイル配信:
 * 1. dist/ を優先（フロントのビルド成果物）
 * 2. なければ public/ から配信
 * 3. どちらにも無ければ dist/index.html（SPA）を返す
 */
app.use("/*", async (c, next) => {
  const path = c.req.path === "/" ? "/index.html" : c.req.path;

  // dist 側を優先
  try {
    const distPath = `./dist${path}`;
    const stat = await Deno.stat(distPath);
    if (stat.isFile) {
      return serveStatic({ root: "./dist" })(c, next);
    }
  } catch {
    // dist に無い場合は public を試す
  }

  // public
  try {
    const publicPath = `./public${path}`;
    const stat = await Deno.stat(publicPath);
    if (stat.isFile) {
      return serveStatic({ root: "./public" })(c, next);
    }
  } catch {
    // public にも無ければ SPA として index.html
    return serveStatic({
      root: "./dist",
      path: "/index.html",
    })(c, next);
  }

  // 念のため
  return c.notFound();
});

const port = Number(Deno.env.get("PORT") ?? "4000");

console.log(`🚀 WebSocket endpoint: ws://localhost:${port}/ws`);
console.log(`📄 HTML endpoint    : http://localhost:${port}/`);
console.log(`❤️  Health check    : http://localhost:${port}/health`);

/**
 * Deno ネイティブサーバ起動
 */
Deno.serve({ port }, app.fetch);
