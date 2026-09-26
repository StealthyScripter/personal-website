import { useId, useState } from 'react';
import { api, mediaUrl, type ImageValue, type Media } from './api';

export function Field({ label, value, onChange, multiline = false, type = 'text', required = false }: { label: string; value?: string; onChange: (value: string) => void; multiline?: boolean; type?: string; required?: boolean }) {
  const id = useId();
  return <label htmlFor={id}>{label}{multiline ? <textarea id={id} value={value || ''} onChange={(event) => onChange(event.target.value)} rows={4} required={required} /> : <input id={id} type={type} value={value || ''} onChange={(event) => onChange(event.target.value)} required={required} />}</label>;
}
export function Check({ label, value, onChange }: { label: string; value?: boolean; onChange: (value: boolean) => void }) { return <label className="check"><input type="checkbox" checked={value || false} onChange={(event) => onChange(event.target.checked)} />{label}</label>; }
export function Feedback({ error, success }: { error?: string; success?: string }) { return <>{error && <p className="feedback error" role="alert">{error}</p>}{success && <p className="feedback" role="status">{success}</p>}</>; }
export function AssetPicker({ label, media, accept, onSelect, onUpload }: { label: string; media: Media[]; accept: 'image' | 'video' | 'captions'; onSelect: (asset: Media) => void; onUpload: (asset: Media) => void }) {
  const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const available = media.filter((asset) => accept === 'captions' ? asset.mimeType === 'text/vtt' : asset.mimeType.startsWith(`${accept}/`));
  return <div className="asset-picker"><label>Choose {label}<select value="" onChange={(event) => { const asset = available.find((item) => item.id === event.target.value); if (asset) onSelect(asset); }}><option value="">Select existing media</option>{available.map((asset) => <option value={asset.id} key={asset.id}>{asset.originalName}</option>)}</select></label>
    <label>Upload {label}<input type="file" disabled={busy} accept={accept === 'image' ? '.png,.jpg,.jpeg,.webp,.gif' : accept === 'video' ? '.mp4,.webm' : '.vtt'} onChange={async (event) => {
      const file = event.target.files?.[0]; if (!file) return; setBusy(true); setError('');
      try { const data = new FormData(); data.append('file', file); const asset = await api<Media>('/media', 'POST', data); onUpload(asset); onSelect(asset); } catch (error) { setError((error as Error).message); } finally { setBusy(false); event.target.value = ''; }
    }} /></label>{busy && <p role="status">Uploading…</p>}<Feedback error={error} /></div>;
}
export function ImageField({ label, value, onChange, media, onUpload }: { label: string; value?: ImageValue; onChange: (value?: ImageValue) => void; media: Media[]; onUpload: (asset: Media) => void }) {
  return <fieldset className="image-field"><legend>{label}</legend><AssetPicker label={label.toLowerCase()} media={media} accept="image" onUpload={onUpload} onSelect={(asset) => onChange({ src: asset.url, alt: value?.alt || '', caption: value?.caption, width: asset.width!, height: asset.height! })} />
    {value && <><img src={mediaUrl(value.src)} alt={value.alt || 'Selected image preview'} /><Field label={`${label} alt text`} value={value.alt} onChange={(alt) => onChange({ ...value, alt })} /><Field label={`${label} caption`} value={value.caption} onChange={(caption) => onChange({ ...value, caption: caption || undefined })} /><button type="button" className="quiet" onClick={() => onChange(undefined)}>Remove {label.toLowerCase()}</button></>}
  </fieldset>;
}
