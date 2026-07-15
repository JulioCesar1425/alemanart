import type { APIRoute } from 'astro';

/**
 * robots.txt generado con la URL real del sitio (astro.config.mjs → site),
 * para que el enlace al sitemap nunca quede desactualizado.
 */
export const GET: APIRoute = ({ site }) => {
  const cuerpo = `User-agent: *
Allow: /

# El panel de administración no debe indexarse.
Disallow: /admin

Sitemap: ${new URL('sitemap-index.xml', site)}
`;
  return new Response(cuerpo, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
