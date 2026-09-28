// The circular CLYX Media mark (client/public/clyx-logo.png by default, editable in the admin). `size` is the rendered diameter in px.
export default function BrandLogo({ size, className = '', src }: { size: number; className?: string; src?: string }) {
  return (
    <img
      src={src || '/clyx-logo.png'}
      alt="CLYX Media"
      width={size}
      height={size}
      decoding="async"
      className={`clyx-logo${className ? ` ${className}` : ''}`}
    />
  );
}
