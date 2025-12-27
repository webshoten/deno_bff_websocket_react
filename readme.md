# Deno WebSocket + React プロジェクト

## 概要

Deno、Hono、Reactを使用したWebSocketサーバーとSPAの統合プロジェクトです。

- **バックエンド**: Hono（Denoネイティブサーバー）
- **フロントエンド**: React（バンドル済み）
- **通信**: WebSocket（`/ws`エンドポイント）

## 起動方法

### 開発モード

```bash
deno task dev
```

- ファイル変更を自動監視してビルド
- サーバーを起動（ポート: 4000）
- 高速ビルド（`--no-check`）

### 本番ビルド

```bash
deno task build
```

- 型チェックありでバンドル
- 出力: `dist/main.bundle.js`

## エンドポイント

- **WebSocket**: `ws://localhost:4000/ws`
- **フロントエンド**: `http://localhost:4000/`
- **ヘルスチェック**: `http://localhost:4000/health`

## プロジェクト構造

```text
├── src/
│   ├── server.ts    # Honoサーバー（WebSocket含む）
│   ├── dev.ts       # 開発モード（ファイル監視 + サーバー起動）
│   └── build.ts     # Reactアプリのバンドル
├── public/          # フロントエンドソース
│   ├── main.tsx
│   ├── App.tsx
│   └── index.html
└── dist/            # ビルド成果物
```
