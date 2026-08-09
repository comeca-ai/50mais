/**
 * Player de vídeo embutido que aceita:
 * - YouTube (youtube.com/watch?v=..., youtu.be/..., /shorts/...)
 * - Google Drive (drive.google.com/file/d/ID/...)
 * - Vimeo (vimeo.com/12345)
 * - Arquivo direto (.mp4, .webm, .ogg)
 */
export function getEmbedUrl(url: string): {
  tipo: "youtube" | "drive" | "vimeo" | "arquivo" | "desconhecido";
  embed: string;
} {
  // YouTube
  const yt =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{6,})/);
  if (yt) {
    return {
      tipo: "youtube",
      embed: `https://www.youtube.com/embed/${yt[1]}?rel=0`,
    };
  }

  // Google Drive
  const drive = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (drive) {
    return {
      tipo: "drive",
      embed: `https://drive.google.com/file/d/${drive[1]}/preview`,
    };
  }

  // Vimeo
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return { tipo: "vimeo", embed: `https://player.vimeo.com/video/${vimeo[1]}` };
  }

  // Arquivo de vídeo direto
  if (/\.(mp4|webm|ogg|mov)(\?|$)/i.test(url)) {
    return { tipo: "arquivo", embed: url };
  }

  return { tipo: "desconhecido", embed: url };
}

export default function VideoPlayer({
  url,
  titulo,
}: {
  url: string;
  titulo: string;
}) {
  const { tipo, embed } = getEmbedUrl(url);

  if (tipo === "arquivo") {
    return (
      <video
        className="aspect-video w-full rounded-2xl bg-black"
        controls
        preload="metadata"
        src={embed}
        aria-label={titulo}
      />
    );
  }

  if (tipo === "desconhecido") {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center gap-4 rounded-2xl bg-secondary p-8 text-center">
        <p className="text-lg font-bold">
          Este vídeo abre em outra página
        </p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="rounded-xl bg-primary px-6 py-3 text-lg font-bold text-primary-foreground underline-offset-4 hover:underline"
        >
          Abrir vídeo em nova aba
        </a>
      </div>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl bg-black">
      <iframe
        src={embed}
        title={titulo}
        className="h-full w-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
