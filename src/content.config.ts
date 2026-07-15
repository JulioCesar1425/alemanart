import { defineCollection, z } from 'astro:content';
import { glob, file } from 'astro/loaders';

/** Convierte '' / null en undefined, para campos opcionales que el panel deja vacíos. */
const vacioAUndefined = (v: unknown) => (v === '' || v === null ? undefined : v);

/**
 * FOTOS. Cada foto es una ficha (.md) en src/content/galeria.
 * El panel (/admin) las crea y borra; el sitio arma la galería al compilar.
 */
const galeria = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/galeria' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.enum(['bodas', 'celebraciones', 'graduacion', 'sesiones-casuales']),
    imagen: z.string(),
    fecha: z.coerce.date(),

    // Visible en el sitio. Permite dejar fotos preparadas sin publicarlas.
    visible: z.boolean().default(true),

    // Collage principal: un número fija la foto en ese casillero (1-10);
    // 'no' la excluye del collage; vacío = el sitio decide automáticamente.
    posicionCollage: z.preprocess(
      vacioAUndefined,
      z.union([z.literal('no'), z.coerce.number().int().min(1).max(10)]).optional()
    ),

    // Orden dentro de la galería de su categoría (1 = primera).
    // Vacío = se ordena por fecha, más recientes primero.
    ordenCategoria: z.preprocess(
      vacioAUndefined,
      z.coerce.number().int().min(1).optional()
    ),

    // Fuerza que esta foto salga en la portada rotativa de su categoría.
    enPortadaCategoria: z.boolean().default(false),
  }),
});

/** OPINIONES de clientes (carrusel de la sección "Opiniones"). */
const testimonios = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/testimonios' }),
  schema: z.object({
    texto: z.string(),
    autor: z.string(),
    visible: z.boolean().default(true),
    orden: z.preprocess(vacioAUndefined, z.coerce.number().int().min(1).optional()),
  }),
});

/** PAQUETES fotográficos (eventos y sesiones casuales). */
const paquetes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/paquetes' }),
  schema: z.object({
    nombre: z.string(),
    precio: z.string(),
    tipo: z.enum(['eventos', 'casuales']),
    orden: z.coerce.number().int().min(1),
    destacado: z.boolean().default(false),
    items: z.array(z.string()).default([]),
    nota: z.preprocess(vacioAUndefined, z.string().optional()),
    visible: z.boolean().default(true),
  }),
});

/**
 * AJUSTES generales: videos, extras y servicios de video.
 * El panel guarda este archivo como un objeto plano; el parser lo adapta al
 * formato que espera Astro (una lista de entradas con id) y tolera ambos casos.
 */
const ajustes = defineCollection({
  loader: file('./src/data/ajustes.json', {
    parser: (texto) => {
      const datos = JSON.parse(texto);
      const obj = Array.isArray(datos) ? (datos[0] ?? {}) : datos;
      return [{ ...obj, id: 'general' }];
    },
  }),
  schema: z.object({
    videoGaleriaYouTube: z.string().default(''),
    reelsVimeo: z.array(z.object({ id: z.string(), titulo: z.string() })).default([]),
    extras: z.array(z.string()).default([]),
    servicioVideo: z.array(z.string()).default([]),
  }),
});

export const collections = { galeria, testimonios, paquetes, ajustes };
