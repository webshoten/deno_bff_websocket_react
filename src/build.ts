// Reactアプリケーションを事前バンドルするスクリプト
// ローカル環境で実行して、dist/main.bundle.js を生成

// 環境変数 DENO_BUNDLE_NO_CHECK=1 のとき、--no-check で高速バンドル（主に dev 用）
export async function buildReactApp() {
  try {
    const inputFile = "./public/main.tsx";
    const outputDir = "./dist";
    const outputFile = "./dist/main.bundle.js";

    // distディレクトリが存在しない場合は作成
    try {
      await Deno.stat(outputDir);
    } catch {
      await Deno.mkdir(outputDir, { recursive: true });
    }

    console.log("🔄 Reactアプリケーションをバンドル中...");
    console.log(`   入力: ${inputFile}`);
    console.log(`   出力: ${outputFile}`);

    // deno bundleコマンドを実行（出力ファイルを指定せず、標準出力をキャプチャ）
    // --sourcemap=inline を付けて、bundle 内にソースマップを埋め込む
    const noCheck = Deno.env.get("DENO_BUNDLE_NO_CHECK") === "1";
    const args = [
      "bundle",
      "--sourcemap=inline",
      ...(noCheck ? ["--no-check"] : []),
      "--import-map",
      "import_map.json",
      inputFile,
    ];

    const command = new Deno.Command(Deno.execPath(), {
      args,
      stdout: "piped",
      stderr: "piped",
      cwd: Deno.cwd(),
    });

    const { code, stdout, stderr } = await command.output();

    if (code !== 0) {
      const errorText = new TextDecoder().decode(stderr);
      const outputText = new TextDecoder().decode(stdout);
      console.error("❌ バンドルエラー:");
      console.error(errorText);
      console.error(outputText);
      throw new Error(`バンドルに失敗しました: ${errorText}`);
    }

    // 標準出力をファイルに書き込む
    const bundleCode = new TextDecoder().decode(stdout);
    await Deno.writeTextFile(outputFile, bundleCode);

    console.log("✅ バンドルが完了しました");
    console.log(`   出力ファイル: ${outputFile}`);
  } catch (error) {
    console.error("❌ バンドルエラー:", error);
    throw error;
  }
}

if (import.meta.main) {
  // 本番ビルド（deno task build）では通常どおり型チェックありでバンドル
  await buildReactApp();
}
