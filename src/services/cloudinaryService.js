// AI-assisted: see docs/AI_LOG.md #9
// Subida de imágenes a Cloudinary (plan gratuito, recomendado en la sección 7 del taller).
// Se usa un "upload preset" SIN FIRMA: la app nunca conoce el API secret de Cloudinary.
// La carpeta de destino y los límites (formato, tamaño) se configuran dentro del preset en la consola.

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
const UPLOAD_TIMEOUT_MS = 45000;

export const isCloudinaryConfigured = () => Boolean(CLOUD_NAME && UPLOAD_PRESET);

function fileFromUri(uri) {
  const name = uri.split('/').pop() || 'foto.jpg';
  const extension = name.split('.').pop()?.toLowerCase();
  const type = extension === 'png' ? 'image/png' : extension === 'heic' ? 'image/heic' : 'image/jpeg';
  return { uri, name, type };
}

/** Sube una imagen local y devuelve su URL pública (https). */
export async function uploadImage(uri) {
  if (!isCloudinaryConfigured()) {
    throw new Error('Cloudinary no está configurado: revisa EXPO_PUBLIC_CLOUDINARY_* en el archivo .env');
  }

  const form = new FormData();
  form.append('file', fileFromUri(uri)); // en React Native, FormData acepta { uri, name, type }
  form.append('upload_preset', UPLOAD_PRESET);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPLOAD_TIMEOUT_MS);
  try {
    // No se fija Content-Type: React Native agrega el boundary del multipart automáticamente
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: form,
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data?.error?.message ?? `HTTP ${response.status}`);
    return data.secure_url ?? data.url;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Sube varias imágenes en paralelo. Recibe { clave: uri | null } y devuelve { clave: url | null }.
 * onProgress(subidas, total) permite mostrar el avance en pantalla.
 */
export async function uploadImages(images, onProgress) {
  const entries = Object.entries(images).filter(([, uri]) => Boolean(uri));
  let done = 0;
  onProgress?.(0, entries.length);

  const uploaded = await Promise.all(
    entries.map(async ([key, uri]) => {
      const url = await uploadImage(uri);
      done += 1;
      onProgress?.(done, entries.length);
      return [key, url];
    }),
  );

  const result = Object.fromEntries(Object.keys(images).map((key) => [key, null]));
  uploaded.forEach(([key, url]) => {
    result[key] = url;
  });
  return result;
}
