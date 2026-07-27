import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// GitHub Pages（プロジェクトサイト）では /<repo>/ 配下で配信されるため、
// 本番ビルド時のみ base をリポジトリ名に合わせる。
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/space-invaders-modern/' : '/',
  plugins: [react()],
}))
