# Diag-Lib

Next.js (App Router)、Supabase、Gemini AIを使用して構築された図解ギャラリーアプリケーションです。
メインサイトのサブディレクトリ `/diag-lib` として動作するように設計されています。

## 技術スタック
- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **AI**: Gemini 1.5 Flash (メタデータ自動生成用)
- **Icons**: Lucide React

## 機能
- **ギャラリー**: 検索機能付きの図解グリッド表示（タイトル/説明文検索）。
- **詳細ビュー**: SVGのプレビューと詳細表示。
- **クライアントサイド色変更**: ダウンロード前にブラウザ上でSVGの色をカスタマイズ可能。
- **エクスポート**: PNGまたはSVGとしてダウンロード、またはクリップボードにコピー。
- **管理画面**: SVGアップロード機能。Gemini APIによりタイトル・タグ・説明文を自動生成。パスワード保護付き。

## セットアップ手順

### 1. 環境変数の設定
`.env.local` ファイルを作成し、以下の変数を設定してください（このファイルはGitに含めないでください）:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
GEMINI_API_KEY=your_gemini_api_key
ADMIN_PASSWORD=your_secure_password
```

### 2. データベースのセットアップ
SupabaseのSQL Editorで、プロジェクト内の `supabase_setup.sql` スクリプトを実行してください。
テーブル、ストレージバケット、RLS（Row Level Security）ポリシー、検索用インデックスが作成されます。

### 3. ライブラリのインストール
```bash
npm install
```

### 4. ローカルでの実行
```bash
npm run dev
```
ブラウザで `http://localhost:3000/diag-lib` にアクセスしてください。

## デプロイ (Vercel)

このプロジェクトは `basePath: '/diag-lib'` で構成されています。
通常のVercelプロジェクトとしてデプロイ可能です。

メインサイト (Apexia Lab) のドメイン配下（`domain.com/diag-lib`）で表示させるには:
1.  このプロジェクトをVercelにデプロイします（例: `diag-lib.vercel.app`）。
2.  **メインサイト** の `vercel.json` に以下のRewrite設定を追加します:
    ```json
    {
      "rewrites": [
        {
          "source": "/diag-lib",
          "destination": "https://diag-lib.vercel.app/diag-lib"
        },
        {
          "source": "/diag-lib/:path*",
          "destination": "https://diag-lib.vercel.app/diag-lib/:path*"
        }
      ]
    }
    ```
