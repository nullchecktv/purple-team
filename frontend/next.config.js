/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://na4zg40otd.execute-api.us-east-1.amazonaws.com',
  },
}

module.exports = nextConfig
