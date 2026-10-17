/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: [
    '@personal-mentor/shared',
    '@personal-mentor/skills',
    '@personal-mentor/core',
    '@personal-mentor/ai-router',
  ],
};

export default nextConfig;
