// Transforme un lien de partage (Google Drive, YouTube, fichier vidéo) en source de lecteur intégrable.

/**
 * @param {string} url
 * @returns {{ kind: 'drive' | 'youtube' | 'file', src: string } | null}
 */
export function toEmbed(url) {
  const u = String(url ?? '').trim();
  if (!u) return null;

  // Google Drive : /file/d/<id>/view, /preview, ou open?id=<id>
  const drive = u.match(/drive\.google\.com\/(?:file\/d\/([\w-]+)|open\?id=([\w-]+))/);
  if (drive) return { kind: 'drive', src: `https://drive.google.com/file/d/${drive[1] ?? drive[2]}/preview` };

  // YouTube : watch?v=, youtu.be/, shorts/, embed/
  const yt = u.match(/(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  if (yt) {
    return { kind: 'youtube', src: `https://www.youtube-nocookie.com/embed/${yt[1]}?rel=0&modestbranding=1&playsinline=1&autoplay=1` };
  }

  // Fichier vidéo hébergé (dans /public ou sur un CDN)
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(u)) return { kind: 'file', src: u };

  return null;
}
