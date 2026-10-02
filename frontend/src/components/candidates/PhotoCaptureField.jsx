import { useEffect, useRef, useState } from 'react';
import { Camera, Trash2, Video, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { resolvePhotoUrl } from '@/services/api';

const CAPTURE_WIDTH = 320;
const CAPTURE_HEIGHT = 240;

// Campo de foto do candidato: aceita um link http(s) digitado OU uma captura da
// webcam (vira um data URI; o backend decodifica, salva o arquivo e devolve o
// caminho). `value` é sempre o que vai no formulário: um link, um caminho já
// salvo (/photos/...) ou, enquanto não enviado, o data URI recém-capturado.
export function PhotoCaptureField({ id, value, onChange, disabled }) {
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCapturing(false);
  }

  useEffect(() => () => stopCamera(), []);

  async function startCamera() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: CAPTURE_WIDTH, height: CAPTURE_HEIGHT },
      });
      streamRef.current = stream;
      setCapturing(true);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError('Não foi possível acessar a câmera. Verifique as permissões do navegador.');
    }
  }

  function capture() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = CAPTURE_WIDTH;
    canvas.height = CAPTURE_HEIGHT;
    canvas.getContext('2d').drawImage(video, 0, 0, CAPTURE_WIDTH, CAPTURE_HEIGHT);
    onChange(canvas.toDataURL('image/jpeg', 0.8));
    stopCamera();
  }

  const isDataUri = value?.startsWith('data:');
  const previewUrl = isDataUri ? value : resolvePhotoUrl(value);

  if (capturing) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-md border bg-muted/30 p-3">
        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <video ref={videoRef} autoPlay playsInline muted className="aspect-[4/3] w-full max-w-xs rounded-md bg-black" />
        <div className="flex gap-2">
          <Button type="button" size="sm" onClick={capture}><Camera /> Capturar</Button>
          <Button type="button" size="sm" variant="outline" onClick={stopCamera}><X /> Cancelar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        {previewUrl ? (
          <img src={previewUrl} alt="" className="size-16 shrink-0 rounded-md object-cover" />
        ) : (
          <div className="flex size-16 shrink-0 items-center justify-center rounded-md border border-dashed text-muted-foreground">
            <Camera className="size-5" />
          </div>
        )}
        <div className="flex flex-1 flex-col gap-2">
          <Input
            id={id}
            value={isDataUri ? '' : value ?? ''}
            placeholder={isDataUri ? 'Foto capturada pela câmera' : 'https://... (ou tire uma foto)'}
            disabled={disabled || isDataUri}
            onChange={(e) => onChange(e.target.value)}
          />
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={startCamera}>
              <Video /> Usar câmera
            </Button>
            {value && (
              <Button type="button" size="sm" variant="outline" disabled={disabled} onClick={() => onChange('')}>
                <Trash2 /> Remover
              </Button>
            )}
          </div>
        </div>
      </div>
      {error && <p className="text-sm text-danger">{error}</p>}
    </div>
  );
}
