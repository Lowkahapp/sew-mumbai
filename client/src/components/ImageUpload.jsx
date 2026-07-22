import { useId, useRef, useState } from 'react';

const MAX_BYTES = 750_000;
const ACCEPT = 'image/jpeg,image/png,image/webp';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Photo picker with preview. Returns base64 data URL via onChange.
 */
export default function ImageUpload({
  label = 'Photo',
  hint = 'JPEG, PNG, or WebP · max 750 KB',
  value = '',
  onChange,
  className = '',
}) {
  const inputId = useId();
  const inputRef = useRef(null);
  const [error, setError] = useState('');

  const pick = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');

    if (!ACCEPT.split(',').includes(file.type)) {
      setError('Use JPEG, PNG, or WebP');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError('Image must be under 750 KB');
      return;
    }

    try {
      const dataUrl = await readFileAsDataUrl(file);
      onChange?.(dataUrl);
    } catch {
      setError('Could not read image');
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const clear = () => {
    setError('');
    onChange?.('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className={className}>
      <label htmlFor={inputId} className="label">
        {label}
      </label>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-dashed border-navy/15 bg-sand-100">
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <span className="px-2 text-center text-xs text-navy/40">No photo</span>
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <input
            ref={inputRef}
            id={inputId}
            type="file"
            accept={ACCEPT}
            className="hidden"
            onChange={pick}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-secondary text-sm"
              onClick={() => inputRef.current?.click()}
            >
              {value ? 'Change photo' : 'Upload photo'}
            </button>
            {value && (
              <button type="button" className="btn-ghost text-sm" onClick={clear}>
                Remove
              </button>
            )}
          </div>
          <p className="text-xs text-navy/45">{hint}</p>
          {error && (
            <p className="text-xs text-rose-600" role="alert">
              {error}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
