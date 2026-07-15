/**
 * Genera `dist/_headers` (formato Netlify) tras cada build.
 *
 * Por qué existe: Astro inserta algunos scripts en línea (el JSON-LD de SEO y los
 * módulos pequeños). Para no tener que abrir la CSP con 'unsafe-inline' —que anula
 * buena parte de su protección— calculamos el hash SHA-256 de cada script en línea
 * y lo autorizamos individualmente. Como corre en build, no cuesta nada en runtime.
 */
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, extname } from 'node:path';

const DIST = 'dist';

/** Recorre dist/ y devuelve las rutas de todos los .html */
async function buscarHtml(dir) {
  const encontrados = [];
  for (const entrada of await readdir(dir, { withFileTypes: true })) {
    const ruta = join(dir, entrada.name);
    if (entrada.isDirectory()) encontrados.push(...(await buscarHtml(ruta)));
    else if (extname(entrada.name) === '.html') encontrados.push(ruta);
  }
  return encontrados;
}

/** Extrae el contenido de los <script> sin atributo src */
function scriptsEnLinea(html) {
  const contenidos = [];
  const re = /<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = re.exec(html)) !== null) contenidos.push(m[2]);
  return contenidos;
}

const sha256 = (texto) => `'sha256-${createHash('sha256').update(texto, 'utf8').digest('base64')}'`;

const paginas = await buscarHtml(DIST);
const hashes = new Set();
// Los scripts del panel (/admin) se autorizan en su propia CSP, no en la global.
const hashesAdmin = new Set();
for (const pagina of paginas) {
  const esAdmin = pagina.replace(/\\/g, '/').includes('/admin/');
  for (const script of scriptsEnLinea(await readFile(pagina, 'utf8'))) {
    (esAdmin ? hashesAdmin : hashes).add(sha256(script));
  }
}

// Orígenes de terceros estrictamente necesarios (solo los reproductores de video).
const YOUTUBE = 'https://www.youtube-nocookie.com https://www.youtube.com';
const VIMEO = 'https://player.vimeo.com';

const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `img-src 'self' data:`,
  `font-src 'self'`,
  // Swiper y PhotoSwipe escriben estilos en línea para animar; 'unsafe-inline' aquí
  // es de bajo riesgo (no ejecuta código) y evita romper los carruseles.
  `style-src 'self' 'unsafe-inline'`,
  `script-src 'self' ${[...hashes].join(' ')}`,
  `connect-src 'self'`,
  `media-src 'self'`,
  `manifest-src 'self'`,
  `worker-src 'none'`,
  `frame-src ${YOUTUBE} ${VIMEO}`,
  `upgrade-insecure-requests`,
].join('; ');

const permissions = [
  'accelerometer=()',
  'camera=()',
  'geolocation=()',
  'gyroscope=()',
  'magnetometer=()',
  'microphone=()',
  'payment=()',
  'usb=()',
  'interest-cohort=()',
  `fullscreen=(self "https://www.youtube-nocookie.com" "${VIMEO}")`,
].join(', ');

const contenido = `# Generado automáticamente por scripts/generar-headers.mjs — no editar a mano.

/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: ${permissions}
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Cross-Origin-Opener-Policy: same-origin
  Cross-Origin-Resource-Policy: same-origin
  X-DNS-Prefetch-Control: off

# El panel de administración necesita cargar el CMS desde unpkg y hablar con GitHub.
# La sintaxis "! Header" (soportada por Cloudflare Pages) quita la CSP estricta global
# y la reemplaza por una hecha a la medida del panel. No afecta al resto del sitio.
/admin/*
  ! Content-Security-Policy
  ! Cross-Origin-Resource-Policy
  Content-Security-Policy: default-src 'self'; script-src 'self' https://unpkg.com ${[...hashesAdmin].join(' ')}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' data: https://fonts.gstatic.com; img-src 'self' blob: data: https:; connect-src 'self' https: wss:; frame-ancestors 'none'; base-uri 'self'; form-action 'self' https://github.com
  X-Robots-Tag: noindex

# Los assets llevan hash en el nombre: se cachean para siempre (mejora el rendimiento).
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

# El HTML siempre se revalida para que los cambios se vean de inmediato.
/*.html
  Cache-Control: public, max-age=0, must-revalidate

/
  Cache-Control: public, max-age=0, must-revalidate
`;

await writeFile(join(DIST, '_headers'), contenido, 'utf8');
console.log(
  `✓ dist/_headers generado — ${paginas.length} página(s), ${hashes.size} hash(es) del sitio, ${hashesAdmin.size} del panel`
);
