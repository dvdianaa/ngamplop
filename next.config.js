/** @type {import('next').NextConfig} */
const REPO_NAME = 'ngamplop' // GANTI sesuai nama repo GitHub kamu

const nextConfig = {
  output: 'export',
  images: { unoptimized: true },
  // Kalau deploy ke username.github.io/REPO_NAME (repo biasa), pakai basePath ini.
  // Kalau deploy ke username.github.io (repo khusus root), KOSONGKAN basePath jadi ''.
  basePath: process.env.GITHUB_PAGES === 'true' ? `/${REPO_NAME}` : '',
}

module.exports = nextConfig
