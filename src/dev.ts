// ファイル変更を監視して自動ビルドを実行するスクリプト

import { buildReactApp } from "./build.ts";

let isBuilding = false;
let buildQueue = false;

async function runBuild() {
  if (isBuilding) {
    buildQueue = true;
    return;
  }

  isBuilding = true;
  buildQueue = false;

  try {
    // 開発時のビルド（deno task dev）では環境変数で --no-check を有効化して高速化
    await buildReactApp();
  } catch (error) {
    console.error("❌ ビルドエラー:", error);
  } finally {
    isBuilding = false;

    // キューにビルドが残っている場合は再実行
    if (buildQueue) {
      await runBuild();
    }
  }
}

async function watchAndBuild() {
  const watchPaths = [
    "./public/main.tsx",
    "./public/App.tsx",
  ];

  console.log("📁 ファイル監視を開始しました");
  console.log("   監視対象:");
  watchPaths.forEach((path) => console.log(`   - ${path}`));

  // 初回ビルドを実行
  console.log("🔄 初回ビルドを実行中...");
  await runBuild();

  // ファイル監視を開始
  try {
    const watcher = Deno.watchFs(watchPaths);

    (async () => {
      for await (const event of watcher) {
        if (event.kind === "modify" || event.kind === "create") {
          console.log(
            `🔄 ファイル変更を検知: ${event.paths.join(", ")}`,
          );
          // 少し待ってからビルド（ファイル書き込み完了を待つ）
          await new Promise((resolve) => setTimeout(resolve, 100));
          await runBuild();
        }
      }
    })();
  } catch (error) {
    console.error("❌ 監視エラー:", error);
  }
}

if (import.meta.main) {
  // バックグラウンドでファイル監視を開始（非同期）
  watchAndBuild().catch((error) => {
    console.error("❌ ファイル監視エラー:", error);
  });

  // サーバーを起動
  console.log("🚀 サーバーを起動中...");
  await import("./server.ts");
}
