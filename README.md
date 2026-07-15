# AlemanArt — Portafolio de fotografía y video

Sitio web de portafolio para AlemanArt (Fátima Nicole Alemán), fotógrafa independiente en El Salvador.

## Stack

- [Astro 7](https://astro.build) — sitio estático, cero JS innecesario
- [Tailwind CSS 4](https://tailwindcss.com) — vía `@tailwindcss/vite`
- [PhotoSwipe 5](https://photoswipe.com) — lightbox de la galería
- [Swiper 11](https://swiperjs.com) — carrusel de testimonios

## Comandos

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo en localhost:4321
npm run build    # compilar a ./dist
npm run preview  # previsualizar el build
```

## Estructura

```
src/
  assets/galeria/fotos/ # todas las fotos (la categoría la define cada ficha, no la carpeta)
  assets/marca/         # logo, hero y fotos de "Quién soy" (fijas, fuera del panel)
  content/galeria/      # una ficha .md por foto, creada/borrada desde /admin
  components/           # Header, Hero, QuienSoy, Paquetes, ServicioVideo, Galeria, Testimonios, Contacto
  data/
    paquetes.json       # paquetes de eventos y casuales, extras y servicios de video
    testimonios.json    # testimonios de clientes e IDs de videos de YouTube
  layouts/Layout.astro  # SEO, fuentes, botón flotante de WhatsApp
  pages/index.astro     # página única (one-page)
  styles/global.css     # paleta de marca y utilidades (Tailwind 4 @theme)
```

## Cómo editar contenido

- **Precios / paquetes / extras**: editar `src/data/paquetes.json`
- **Testimonios o videos de YouTube**: editar `src/data/testimonios.json`
- **Agregar fotos**: usar el panel en `/admin` (ver GUIA-PANEL.md). Manualmente:
  poner el `.jpg` en `src/assets/galeria/fotos/` y crear su ficha en
  `src/content/galeria/`. Recomendado: máx. 1800px de lado largo.
- **Nueva categoría**: agregarla al objeto `categorias` de
  `src/components/Galeria.astro` y a las opciones del campo `categoria` en
  `public/admin/config.yml`.
- **Control manual de la galería** (todo opcional, desde `/admin`):
  `visible` (publicar/despublicar sin borrar), `posicionCollage` (1-10 fija un
  casillero; `no` excluye del collage), `ordenCategoria` (1 = primera en su
  categoría) y `enPortadaCategoria` (fuerza que salga en la tarjeta rotativa).
  Lo que se deja vacío se resuelve automáticamente por fecha.
- **Opiniones, paquetes y videos**: viven en `src/content/testimonios/`,
  `src/content/paquetes/` y `src/data/ajustes.json`, todos editables desde
  `/admin` sin tocar código.
- **Número de WhatsApp**: buscar `50375878108` (aparece en Layout, Hero,
  Paquetes y Contacto).

## Paleta de marca

| Color | Hex |
|---|---|
| Coral rojo | `#E63946` |
| Rosa pálido | `#F4A6A9` |
| Azul profundo | `#0B5FB8` |
| Dorado ámbar | `#E7B563` |
| Crema (fondo) | `#FBF8F4` |
| Tinta (texto) | `#211C1A` |

Tipografía: Playfair Display (titulares) + Inter (cuerpo), vía Google Fonts.

## SEO y analítica

- `sitemap-index.xml` y `sitemap-0.xml` se generan en cada build con
  `@astrojs/sitemap` (el panel `/admin` queda excluido).
- `src/pages/robots.txt.ts` genera el `robots.txt` con el enlace al sitemap
  derivado de `site`, así nunca queda desactualizado.
- La URL pública sale de `SITE_URL` (variable de entorno) con respaldo a la de
  Workers. Se usa para el sitemap, el canonical, `og:image` y el JSON-LD: al
  contratar un dominio propio basta definir `SITE_URL` en Cloudflare.
- Analítica de Cloudflare (sin cookies): se activa poniendo
  `PUBLIC_CF_BEACON_TOKEN`. Sin esa variable no se carga ningún script.
  Los dominios del beacon ya están permitidos en la CSP, así que también
  funciona la activación de un clic desde Cloudflare (Metrics → Enable).

## Optimización de imágenes

Doble red de seguridad:
1. **Al subir** (`media_libraries.default.config.transformations` en
   `public/admin/config.yml`): el panel convierte a WebP q90 y limita el lado
   largo a 1800px **en el navegador**, antes de escribir al repositorio.
2. **Al compilar**: Astro genera las variantes del `srcset` desde ese archivo.

## Seguridad

El script `scripts/generar-headers.mjs` corre automáticamente tras `npm run build` y
genera `dist/_headers` (formato Netlify) con:

- **Content-Security-Policy** estricta. Los scripts en línea se autorizan por hash
  SHA-256 (calculado en cada build), no con `'unsafe-inline'`. Solo se permiten
  iframes de YouTube y Vimeo.
- `X-Frame-Options: DENY` y `frame-ancestors 'none'` — el sitio no puede incrustarse
  en otras páginas (evita clickjacking).
- `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Strict-Transport-Security`,
  `Cross-Origin-Opener-Policy` y `Permissions-Policy` (cámara, micrófono, GPS y
  geolocalización deshabilitados).
- Caché inmutable de un año para `/_astro/*` (los assets llevan hash en el nombre),
  y revalidación siempre para el HTML.

Ninguna de estas medidas ejecuta código en el navegador: son cabeceras HTTP, así que
no afectan el rendimiento. La caché inmutable de hecho lo mejora.

**Importante:** si agregas un nuevo servicio externo (fuentes, analítica, otro
reproductor de video), hay que añadir su origen a la CSP en `scripts/generar-headers.mjs`
o el navegador lo bloqueará.

## Panel de administración de fotos

El sitio incluye un panel en `/admin` (Sveltia CMS, compatible con Decap) para
agregar, cambiar y eliminar fotos sin tocar código. Cada foto es una ficha `.md`
en `src/content/galeria/`; el collage, las tarjetas rotativas y las galerías por
categoría se recalculan solos en cada build (más recientes primero, por el campo
`fecha`). Una ficha que apunte a una imagen inexistente se omite con un aviso en
el log — nunca rompe el build.

Configuración completa paso a paso (GitHub + Cloudflare + panel): ver
**GUIA-PANEL.md**. Requisito único antes de usar: editar `repo:` en
`public/admin/config.yml`.

`npm run build` valida primero `public/admin/config.yml` con
`scripts/validar-config-panel.mjs` y aborta si hay algo mal: marcadores de conflicto
de Git sin resolver, sintaxis YAML inválida (indica la línea), u opciones que Sveltia
no reconoce (se contrasta con el esquema oficial en
`node_modules/@sveltia/cms/schema/`). Esto importa porque `config.yml` se copia tal
cual al sitio: sin esta validación, un error no rompe el build sino el panel en vivo,
con el mensaje poco útil "The configuration file could not be parsed". Para validarlo
suelto: `npm run validar-panel`.

Nota: la regla `/admin/*` de `dist/_headers` usa la sintaxis de reemplazo de
cabeceras (`! Header`) de Cloudflare Pages; en otros hosts el panel podría quedar
bloqueado por la CSP global.
