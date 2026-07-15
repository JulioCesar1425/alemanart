// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// Dirección pública del sitio. Se usa para el sitemap, el enlace canónico y los
// datos de SEO. El día que haya dominio propio, basta con definir la variable
// SITE_URL en Cloudflare (Settings → Variables) — no hay que tocar el código.
const SITE = process.env.SITE_URL || 'https://alemanart.photoography.workers.dev';

export default defineConfig({
  site: SITE,
  integrations: [
    sitemap({
      // El panel de administración no debe aparecer en Google.
      filter: (page) => !page.includes('/admin'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
