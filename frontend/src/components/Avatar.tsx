type Props = { src?: string | null; alt: string; size?: number };

export default function Avatar({ src, alt, size = 64 }: Props) {
  const cls = "rounded-full bg-slate-200 dark:bg-slate-800 object-cover";
  if (!src) {
    return (
      <div
        className={`${cls} flex items-center justify-center`}
        style={{ width: size, height: size }}
        aria-label={alt}
      >
        <span className="text-slate-500 dark:text-slate-400 text-sm">No Avatar</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} width={size} height={size} className={cls} />;
}

