import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Cada foto de la galería es una pequeña ficha (.md) en src/content/galeria.
 * El panel de administración (/admin) crea y borra estas fichas; el sitio las
 * lee al compilar y arma la galería automáticamente, ordenada por fecha.
 */
const galeria = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/galeria' }),
  schema: z.object({
    titulo: z.string(),
    categoria: z.enum(['bodas', 'celebraciones', 'graduacion', 'sesiones-casuales']),
    imagen: z.string(),
    fecha: z.coerce.date(),
    // Opcional: fija la foto en un casillero específico del collage principal (1-10).
    // Si se omite (o llega vacío desde el panel), el sitio elige automáticamente
    // entre las fotos más recientes.
    posicionCollage: z.preprocess(
      (v) => (v === '' || v === null || v === undefined ? undefined : v),
      z.coerce.number().int().min(1).max(10).optional()
    ),
  }),
});

export const collections = { galeria };
