import { defineConfig, minimal2023Preset as preset } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    ...preset,
    appleSplashScreens: {
      padding: 0.3,
      resizeOptions: { background: '#fcfaf2', fit: 'contain' },
      darkResizeOptions: { background: '#171717', fit: 'contain' },
      sizes: [
        { width: 320, height: 480, scaleFactor: 1 },
        { width: 640, height: 960, scaleFactor: 2 },
        { width: 640, height: 1136, scaleFactor: 2 },
        { width: 750, height: 1334, scaleFactor: 2 },
        { width: 828, height: 1792, scaleFactor: 2 },
        { width: 1125, height: 2436, scaleFactor: 3 },
        { width: 1242, height: 2208, scaleFactor: 3 },
        { width: 1242, height: 2688, scaleFactor: 3 },
      ],
    },
  },
  images: ['public/icon-source.png'],
})
