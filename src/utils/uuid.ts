export function generateUUID(): string {
  // Utiliser crypto.randomUUID si disponible (navigateurs modernes)
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback cryptographiquement sûr avec crypto.getRandomValues
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buffer = new Uint8Array(16);
    crypto.getRandomValues(buffer);

    // Ajuster les bits pour UUID v4
    buffer[6] = (buffer[6] & 0x0f) | 0x40; // Version 4
    buffer[8] = (buffer[8] & 0x3f) | 0x80; // Variant 10

    const hex = Array.from(buffer)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  }

  // Si aucune API crypto n'est disponible, lancer une erreur
  throw new Error(
    'Crypto API not available. Please use HTTPS or update your browser.',
  );
}