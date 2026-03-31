@AGENTS.md
# stock_frontend

## プロジェクト概要

`stock_backend`（Go/Gin）のフロントエンド。株価チャートの表示・ウォッチリスト管理・企業ロゴ分析を行う。

## 技術スタック

| 用途 | ライブラリ |
|---|---|
| フレームワーク | Next.js (App Router) |
| 言語 | TypeScript |
| APIクライアント | openapi-fetch |
| 型生成 | openapi-typescript |
| チャート | TradingView Lightweight Charts |
| スタイル | Tailwind CSS |
| データ取得 | SWR |

## ディレクトリ構成

```
src/
├── app/                        # ページ・レイアウト（App Router）
├── components/                 # UIコンポーネント（View層）
├── hooks/                      # カスタムフック（ViewModelに近い役割）
│   ├── useCandles.ts           # ローソク足データ取得
│   ├── useSymbols.ts           # 銘柄一覧取得
│   └── useWatchlist.ts         # ウォッチリスト操作
└── lib/
    ├── api.ts                  # APIクライアント（openapi-fetch）
    └── generated/
        └── schema.ts           # 自動生成の型定義（直接編集禁止）
```

## アーキテクチャ方針

### コンポーネント戦略

- **Server Component をデフォルト**とし、インタラクションが必要な場合のみ `"use client"` を付与する
- ローソク足チャート・ウォッチリストは操作が多いため Client Component

| 機能 | 方式 |
|---|---|
| 銘柄一覧 | Server Component（SSR）|
| ローソク足チャート | Client Component |
| ウォッチリスト | Client Component |
| ロゴ検出・企業分析 | Client Component |

### 状態管理

- **選択中の銘柄・期間** → URL の searchParams で管理（ブックマーク・共有に対応）
- **サーバーデータ** → SWR（キャッシュ・ローディング・エラー管理）
- **JWTトークン** → Cookie または localStorage
- グローバル状態管理ライブラリ（Zustand等）は必要になったタイミングで追加する

### 層の役割

```
コンポーネント (components/)
    ↓ hooks を呼ぶ
カスタムフック (hooks/)
    ↓ api.ts を呼ぶ
APIクライアント (lib/api.ts)
    ↓
Go バックエンド
```

## API

- `NEXT_PUBLIC_API_BASE_URL` 環境変数でベースURLを管理
- 認証: JWT（Authorization: Bearer トークン）
- 型定義は `schema.ts` から自動生成されるため、補完・型エラーが有効

### 主要エンドポイント

| エンドポイント | 用途 |
|---|---|
| `GET /v1/candles/{code}` | ローソク足データ取得 |
| `GET /v1/symbols` | アクティブ銘柄一覧 |
| `GET /v1/watchlist` | ウォッチリスト取得 |
| `POST /v1/watchlist` | ウォッチリスト追加 |
| `DELETE /v1/watchlist/{code}` | ウォッチリスト削除 |
| `PUT /v1/watchlist/order` | ウォッチリスト並び替え |
| `POST /v1/logo/detect` | 画像からロゴ検出 |
| `POST /v1/logo/analyze` | 企業分析サマリー生成 |

## デザイン方針

- テーマ: ライト、ミニマル（WealthNavi・Linear を参考）
- テキスト: `#0f172a`
- 上昇・プラス: `#16a34a`
- 下落・マイナス: `#dc2626`

## コーディング規約

- API呼び出しは必ず `src/lib/api.ts` 経由で行う
- `src/lib/generated/` 以下は直接編集しない
- ロジックはカスタムフックに切り出し、コンポーネントは表示に専念させる
- 環境変数は `.env.local` で管理し、`.env.example` をリポジトリに含める

## よく使うコマンド

```bash
npm run dev           # 開発サーバー起動
npm run build         # 本番ビルド
npm run generate:api  # openapi.yaml から schema.ts を再生成
```

## 型定義の再生成

バックエンドの `openapi.yaml` を更新したら以下を実行：

```bash
npm run generate:api
# = npx openapi-typescript openapi/openapi.yaml -o src/lib/generated/schema.ts
```