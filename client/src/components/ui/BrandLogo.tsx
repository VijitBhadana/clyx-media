// The circular CLYX Media mark (client/public/clyx-logo.png). `size` is the rendered diameter in px.
export default function BrandLogo({ size, className = '' }: { size: number; className?: string }) {
  return (
    <img
      src="/clyx-logo.png"
      alt="CLYX Media"
      width={size}
      height={size}
      decoding="async"
      className={`clyx-logo${className ? ` ${className}` : ''}`}
    />
  );
}
