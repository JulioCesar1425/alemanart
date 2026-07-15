# 📸 Guía del panel de fotos de AlemanArt

Esta guía te lleva, paso a paso y sin conocimientos técnicos, desde cero hasta poder
cambiar las fotos del sitio desde tu navegador (incluso desde el celular).

La configuración inicial (Partes 1 a 3) se hace **una sola vez** y toma unos 30-40
minutos. Después, tu día a día es solo la Parte 5.

---

## Cómo funciona (en 30 segundos)

- Tu sitio vive en **GitHub** (una caja fuerte gratuita para los archivos del proyecto).
- **Cloudflare** vigila esa caja: cada vez que algo cambia, reconstruye y publica
  el sitio automáticamente (gratis, hasta 500 publicaciones al mes).
- El **panel** (`tusitio.workers.dev/admin`) es la pantalla amigable con la que tú cambias
  las fotos sin tocar nada técnico. Cada cambio tarda ~2 minutos en verse en línea.

---

## Parte 1 — Poner el proyecto en GitHub (una sola vez)

1. Entra a [github.com](https://github.com) e inicia sesión con tu cuenta.
2. Arriba a la derecha, botón **+** → **New repository**.
3. En "Repository name" escribe: `alemanart`
4. Marca la opción **Private** (para que el código no sea público).
5. Botón verde **Create repository**. Deja esa página abierta.

**Ahora sube los archivos.** La forma más fácil sin instalar nada:

6. En la página del repositorio recién creado, haz clic en el enlace
   **"uploading an existing file"**.
7. Abre en tu computadora la carpeta `alemanart` (la del proyecto descomprimido) y
   **arrastra todo su contenido** (las carpetas `src`, `public`, `scripts` y los
   archivos sueltos) a la página de GitHub.
   - ⚠️ **NO subas** las carpetas `node_modules`, `dist` ni `.astro` si existen
     (son basura regenerable y GitHub las rechazaría por tamaño).
8. Abajo, botón verde **Commit changes**. Espera a que termine de subir.

> 💡 **Un cambio pequeño antes de seguir:** en GitHub, navega a la carpeta
> `public/admin`, abre el archivo `config.yml`, haz clic en el lápiz ✏️ (editar), y en
> la línea que dice `repo: TU-USUARIO/alemanart` reemplaza `TU-USUARIO` por tu nombre
> de usuario real de GitHub. Botón **Commit changes**. Listo.

---

## Parte 2 — Conectar Cloudflare (una sola vez)

> Cloudflare unificó "Pages" y "Workers" en un solo producto. Si en tu panel solo
> ves **Workers & Pages**, es lo normal: sigue estos pasos tal cual.

1. Crea una cuenta gratis en [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up).
2. Menú izquierdo: **Compute → Workers & Pages** → botón **Create application**.
3. Elige la opción de **importar un repositorio de Git** (no "plantilla" ni "Worker en
   blanco"). Autoriza a Cloudflare a ver tu GitHub y selecciona `alemanart`.
4. En la pantalla de configuración:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy` (viene por defecto; el proyecto ya
     incluye el archivo `wrangler.jsonc` que hace que esto funcione)
   - En **Environment variables**, agrega: nombre `NODE_VERSION`, valor `22`
5. Botón **Deploy**. La primera compilación tarda unos minutos.
6. Al terminar te dará tu dirección, tipo `https://alemanart.TU-USUARIO.workers.dev`.
   **Ese es tu sitio.** Cada cambio futuro se publica solo en esa misma dirección.

## Parte 3 — Entrar al panel por primera vez

1. Ve a `https://alemanart.TU-USUARIO.workers.dev/admin` (con tu dirección real).

2. ⚠️ **No uses el botón "Sign in with GitHub"** todavía. Ese botón intenta pasar por
   Netlify (un rodeo que el panel trae de fábrica) y como tu sitio no está en Netlify,
   dará el error **"Not Found"**. Para que ese botón funcione hace falta completar la
   Parte 4, que es opcional.

3. En su lugar, usa **"Sign in with Token"** (aparece como opción o enlace en la misma
   pantalla de acceso):
   - El panel te mostrará un enlace directo a GitHub con los permisos ya
     preseleccionados. Ábrelo.
   - En GitHub: ponle un nombre al token (ej. "Panel AlemanArt"), elige expiración
     "No expiration" (o 1 año), y botón verde **Generate token**.
   - Copia el código que aparece (empieza con `ghp_...`), pégalo en el panel y entra.
   - 🔑 Guarda ese código en un lugar seguro (una nota protegida con contraseña): es
     tu llave de acceso. GitHub no vuelve a mostrártelo.

4. ¡Dentro! Verás la colección **Fotos del sitio** con las 54 fotos actuales, cada una
   con su miniatura.

## Parte 4 (opcional) — Inicio de sesión de un solo clic

Esto reemplaza el token por un botón "Entrar con GitHub" de un clic. Toma ~15 minutos:

1. Entra a
   [github.com/sveltia/sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)
   y haz clic en el botón **Deploy to Cloudflare Workers**. Sigue los pasos (usará tu
   cuenta de Cloudflare de la Parte 2). Al final te dará una dirección tipo
   `https://sveltia-cms-auth.TUNOMBRE.workers.dev` — cópiala.
2. En GitHub: tu foto (arriba a la derecha) → **Settings** → al final del menú
   izquierdo **Developer settings** → **OAuth Apps** → **New OAuth App**:
   - Application name: `Panel AlemanArt`
   - Homepage URL: `https://alemanart.TU-USUARIO.workers.dev`
   - Authorization callback URL: la dirección del paso 1 **+ `/callback`**
     (ej. `https://sveltia-cms-auth.TUNOMBRE.workers.dev/callback`)
   - **Register application** → **Generate a new client secret**.
   - Deja a la vista el **Client ID** y el **Client Secret**.
3. En Cloudflare: **Workers & Pages** → abre `sveltia-cms-auth` → **Settings** →
   **Variables** → agrega:
   - `GITHUB_CLIENT_ID` = el Client ID del paso 2
   - `GITHUB_CLIENT_SECRET` = el Client Secret del paso 2
   - `ALLOWED_DOMAINS` = tu dirección del sitio sin `https://`
     (ej. `alemanart.TU-USUARIO.workers.dev`)
   - Guarda y vuelve a desplegar (**Deploy**).
4. En GitHub, edita `public/admin/config.yml` (como en la Parte 1) y en la línea
   `# base_url: ...` quita el `#` del inicio y pon tu dirección del paso 1.
   **Commit changes**.
5. A partir del próximo build, el panel mostrará "Sign in with GitHub" de un clic.

---

## Parte 5 — Tu día a día con el panel ⭐

**Agregar una foto:**
1. Entra a `/admin` → **Fotos del sitio** → botón **+** (o "New Foto").
2. **Fotografía:** arrastra la imagen o haz clic para elegirla. Puedes subirla
   tal cual sale de la cámara — el panel la comprime y la reduce a 1800px en tu
   navegador antes de subirla, así que no tienes que redimensionar nada a mano.
3. **Título:** un nombre corto (ej. "XV de Andrea").
4. **Categoría:** elige dónde aparece en el sitio.
5. **Fecha:** se llena sola con el momento actual — eso hace que la foto aparezca de
   primera en su categoría. (Si la quieres más abajo, ponle una fecha más antigua.)
6. Botón **Save** (Guardar). En ~2 minutos está en línea.

**Cambiar una foto por otra:** abre la ficha → en Fotografía elige la nueva imagen →
Save. El título, la categoría y la posición se conservan.

**Eliminar una foto:** ábrela → botón **Delete entry** → confirmar.

**Buscar y filtrar:** el panel tiene filtros por categoría y puedes ordenar por fecha,
título o categoría. Por defecto se ven las más nuevas primero, igual que en el sitio.

**Subir varias fotos de una sesión:** repite "Agregar" para cada una. Cada guardado
dispara una publicación (1 de las 500 mensuales gratis) — incluso subiendo 20 fotos en
una tarde estás lejos del límite.

**Controlar dónde aparece cada foto (todo opcional):**
Al final de la ficha de cada foto hay cuatro interruptores. Si no los tocas, el
sitio decide todo solo — solo úsalos cuando quieras mandar tú.

- **Mostrar en el sitio.** Apágalo para dejar una foto preparada (con su título y
  categoría) sin publicarla todavía. Útil si te llegan fotos editadas antes de
  querer anunciar la sesión. Enciéndelo cuando quieras que aparezca.

- **Posición en el collage principal.** El collage de la portada tiene 10
  casilleros. Elige un número para fijar ESA foto ahí (cada opción dice dónde
  queda, ej. "1 · La foto grande de arriba a la izquierda"). Elige **"No incluir
  en el collage"** si la foto solo debe salir en su categoría y no en la portada.
  Déjalo en "Automática" y el sitio elige entre las más recientes.

- **Mostrar en la portada de su categoría.** Cada tarjeta de categoría muestra 3
  fotos que van rotando. Enciéndelo para que esta sea una de ellas.

- **Orden dentro de su categoría.** Pon 1 para que sea la primera al abrir la
  galería de su categoría. Vacío = se ordena sola por fecha.

Si sin querer le pides el mismo casillero del collage a dos fotos, gana la más
nueva — no se rompe nada. En celular el mosaico se reacomoda un poco distinto al
de escritorio para no dejar espacios en blanco, así que la posición exacta puede
variar levemente entre dispositivos.

**Cambiar opiniones, precios o videos:**
En el menú de la izquierda hay cuatro secciones, no solo fotos:
- **Fotos del sitio** — la galería.
- **Opiniones de clientes** — el carrusel de testimonios. Agrega uno nuevo cuando
  un cliente te escriba algo bonito; el campo "Orden" decide cuál va primero.
- **Paquetes y precios** — los 6 paquetes. Puedes cambiar el precio, agregar o
  quitar puntos de "Qué incluye", mover cuál lleva el sello "Más elegido", o
  apagar uno temporalmente con "Mostrar en el sitio".
- **Videos y extras** — el video de la galería (YouTube), los reels verticales
  (Vimeo), la lista de extras y la de servicios de video. Para los videos solo se
  pega el **código**, no el enlace completo: en `vimeo.com/1206869354` el código
  es `1206869354`.

**Qué se actualiza solo con cada cambio:**
- El collage principal (siempre muestra las más recientes, alternando categorías)
- Las 3 fotos que rotan en cada tarjeta de categoría
- La galería completa de cada categoría (más nuevas primero)

**Qué NO se toca desde el panel** (a propósito, para que nunca se rompa):
- La foto grande del inicio (hero), el logo y las fotos de "¿Quién es AlemanArt?" —
  esas están fijas en `src/assets/marca/`. Si algún día quieres cambiarlas, pídemelo o
  reemplaza el archivo del mismo nombre en esa carpeta desde GitHub.

## Activar las estadísticas de visitas (opcional)

Sirve para saber cuánta gente entra, qué secciones miran y desde dónde llegan.
Es gratis, no usa cookies y no recoge datos personales de los visitantes.

**Forma más fácil (2 clics):**
1. En Cloudflare, entra a tu proyecto (**Workers & Pages** → `alemanart`).
2. Ve a la pestaña **Metrics** y pulsa **Enable** bajo *Web Analytics*.
3. Listo. Los datos aparecen en **Web Analytics** del menú de Cloudflare, y
   empiezan a acumularse desde ese momento (no hay datos retroactivos).

**Si por algún motivo lo anterior no registra visitas**, se puede activar a mano:
1. En Cloudflare → **Web Analytics** → agrega tu sitio; te dará un fragmento de
   código con un `token` (una cadena larga de letras y números). Cópialo.
2. En tu proyecto → **Settings** → **Variables and Secrets** → agrega:
   - Nombre: `PUBLIC_CF_BEACON_TOKEN`
   - Valor: el token que copiaste
3. Vuelve a publicar (cualquier commit sirve) y ya queda midiendo.

El sitio funciona igual de bien sin esto: si no pones el token, simplemente no se
carga ninguna analítica.

---

## Preguntas frecuentes

**Me sale "Not Found" al entrar al panel.** Estás usando el botón "Sign in with
GitHub", que necesita la Parte 4 para funcionar. Usa **"Sign in with Token"** (Parte 3).

**¿Cuánto tarda en verse un cambio?** Entre 1 y 3 minutos (lo que tarda la
compilación en Cloudflare). Puedes ver el progreso en Workers & Pages → alemanart.

**¿Puedo usar el panel desde el celular?** Sí, funciona bien en el navegador del
teléfono.

**¿Qué pasa si borro una foto por error?** GitHub guarda el historial completo:
nada se pierde de verdad. Escríbeme y la recuperamos, o en GitHub → pestaña
"Commits" se puede revertir cualquier cambio.

**¿Cuánto cuesta todo esto?** $0. GitHub (repositorio privado), Cloudflare Pages
(500 builds/mes, tráfico ilimitado) y el panel son gratuitos en estos volúmenes.

**¿Y si me paso de 500 publicaciones en un mes?** Tendrías que publicar más de 16
veces al día, todos los días. Si pasara, los cambios simplemente esperan al mes
siguiente — el sitio nunca se cae.
