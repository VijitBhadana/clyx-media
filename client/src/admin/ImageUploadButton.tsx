import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadImage } from './uploadImage';

/** Same button style as Edit / Hide. Picks an image, uploads it, and hands back its URL. */
export function ImageUploadButton({
  onUploaded,
  className = 'rounded-full text-xs gap-1',
  iconSize = 12,
  variant = 'outline',
}: {
  onUploaded: (url: string) => void;
  className?: string;
  iconSize?: number;
  variant?: 'outline' | 'ghost';
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file?: File) => {
    if (!file) return;
    setBusy(true);
    try {
      onUploaded(await uploadImage(file));
    } catch (err) {
      window.alert(`Image upload failed: ${err instanceof Error ? err.message : 'unknown error'}`);
    } finally {
      setBusy(false);
      if (input.current) input.current.value = '';
    }
  };

  return (
    <>
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <Button variant={variant} size="sm" disabled={busy} onClick={() => input.current?.click()} className={className}>
        <ImagePlus size={iconSize} /> {busy ? 'Uploading…' : 'Image'}
      </Button>
    </>
  );
}
