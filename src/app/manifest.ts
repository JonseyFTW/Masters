import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Masters Pick 'Em 2026",
    short_name: "Masters Pool",
    description: "Masters Tournament Pick 'Em Pool - Live Leaderboard & Scoring",
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0f0d',
    theme_color: '#006747',
    orientation: 'portrait',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
