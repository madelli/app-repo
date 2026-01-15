# ベースイメージ
FROM node:20-alpine

# 作業ディレクトリ
WORKDIR /app

# 依存関係をインストール
COPY package.json package-lock.json ./
RUN npm ci

# アプリケーションのコードをコピー
COPY . .

# ビルド
RUN npm run build

# 起動
EXPOSE 3000
CMD ["npm", "start"]
