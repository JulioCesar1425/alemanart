/**
 * Valida `public/admin/config.yml` (la configuración del panel) ANTES de compilar.
 *
 * Por qué existe: ese archivo se copia tal cual al sitio, así que un error de sintaxis
 * o una opción inexistente no rompe el build — rompe el panel en vivo, con el mensaje
 * "The configuration file could not be parsed" y sin pistas de qué línea falló.
 * Este script detecta el problema aquí, con un mensaje claro, en vez de allá.
 *
 * Valida contra el esquema oficial que publica el propio Sveltia CMS.
 */
import { readFileSync, existsSync } from 'node:fs';
import yaml from 'js-yaml';
import Ajv from 'ajv';

const CONFIG = 'public/admin/config.yml';
const SCHEMA = 'node_modules/@sveltia/cms/schema/sveltia-cms.json';

const fallar = (titulo, detalle) => {
  console.error(`\n✗ ${titulo}\n`);
  if (detalle) console.error(`${detalle}\n`);
  console.error('  El panel de /admin no funcionaría. Corrige el archivo y vuelve a compilar.\n');
  process.exit(1);
};

if (!existsSync(CONFIG)) fallar(`No se encontró ${CONFIG}`);

const texto = readFileSync(CONFIG, 'utf8');

// 1) Marcadores de conflicto de Git sin resolver
const conflicto = texto.split('\n').findIndex((l) => /^(<{7}|={7}|>{7})/.test(l));
if (conflicto !== -1) {
  fallar(
    `${CONFIG}: quedó un conflicto de Git sin resolver (línea ${conflicto + 1})`,
    '  Borra las líneas con <<<<<<<, ======= y >>>>>>> y deja solo la versión correcta.'
  );
}

// 2) Sintaxis YAML (indentación, comillas, etc.)
let config;
try {
  config = yaml.load(texto);
} catch (e) {
  const linea = e.mark?.line != null ? ` (línea ${e.mark.line + 1})` : '';
  fallar(`${CONFIG}: error de sintaxis YAML${linea}`, `  ${e.reason ?? e.message}`);
}

// 3) Esquema oficial de Sveltia (opciones válidas y bien formadas)
if (existsSync(SCHEMA)) {
  const schema = JSON.parse(readFileSync(SCHEMA, 'utf8'));
  // logger:false silencia avisos internos del esquema que no afectan la validación.
  const ajv = new Ajv({ allErrors: true, strict: false, allowUnionTypes: true, logger: false });
  const validar = ajv.compile(schema);
  if (!validar(config)) {
    const detalle = (validar.errors ?? [])
      .slice(0, 8)
      .map((e) => `  • ${e.instancePath || '(raíz)'}: ${e.message}`)
      .join('\n');
    fallar(`${CONFIG}: opciones no válidas para Sveltia CMS`, detalle);
  }
} else {
  console.warn(`⚠ ${SCHEMA} no está — se omite la validación de esquema.`);
}

// 4) Avisos útiles (no bloquean el build)
const avisos = [];
if (config?.backend?.repo?.includes('TU-USUARIO')) {
  avisos.push('backend.repo todavía dice TU-USUARIO — el panel no podrá conectarse a GitHub.');
}
const cats = config?.collections?.[0]?.fields?.find((f) => f.name === 'categoria')?.options;
if (cats) {
  const enSitio = ['bodas', 'celebraciones', 'graduacion', 'sesiones-casuales'];
  const sobran = cats.map((o) => o.value).filter((v) => !enSitio.includes(v));
  if (sobran.length) {
    avisos.push(
      `categorías del panel que el sitio no muestra: ${sobran.join(', ')}. ` +
        'Agrégalas también en src/components/Galeria.astro.'
    );
  }
}
avisos.forEach((a) => console.warn(`⚠ ${a}`));

console.log('✓ public/admin/config.yml válido');
