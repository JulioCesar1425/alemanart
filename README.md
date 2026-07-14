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
  assets/galeria/       # fotos por categoría (bodas, celebraciones, graduacion, sesiones-casuales)
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
- **Agregar fotos**: colocar el `.jpg` en la carpeta de su categoría dentro de
  `src/assets/galeria/` — la galería las detecta automáticamente al compilar.
  Recomendado: máx. 1800px de lado largo.
- **Nueva categoría**: crear la carpeta en `src/assets/galeria/` y agregar su
  entrada en el objeto `categorias` de `src/components/Galeria.astro`.
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

Configuración completa paso a paso (GitHub + Cloudflare Pages + panel): ver
**GUIA-PANEL.md**. Requisito único antes de usar: editar `repo:` en
`public/admin/config.yml`.

Nota: la regla `/admin/*` de `dist/_headers` usa la sintaxis de reemplazo de
cabeceras (`! Header`) de Cloudflare Pages; en otros hosts el panel podría quedar
bloqueado por la CSP global.
