/**
 * Leitor de QR Code para Check-in Presencial do Intérprete (RF31, RF32).
 * Combina leitura pela câmera do dispositivo (html5-qrcode) com entrada manual
 * do código para contingência ou demonstração em desktop sem câmera física.
 */
import { Html5Qrcode } from 'html5-qrcode';
import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Alerta, Botao, Campo } from './ui';

interface Props {
  aoLer: (codigo: string) => void;
  carregando?: boolean;
}

export function LeitorQr({ aoLer, carregando }: Props) {
  const idElemento = useId().replace(/:/g, '-');
  const leitorRef = useRef<Html5Qrcode | null>(null);
  const [cameraAtiva, setCameraAtiva] = useState(false);
  const [erroCamera, setErroCamera] = useState('');
  const [codigoManual, setCodigoManual] = useState('');

  useEffect(() => {
    return () => {
      if (leitorRef.current?.isScanning) {
        leitorRef.current.stop().catch(() => undefined);
      }
    };
  }, []);

  async function iniciarCamera() {
    setErroCamera('');
    try {
      const instancia = new Html5Qrcode(`qr-reader-${idElemento}`);
      leitorRef.current = instancia;
      setCameraAtiva(true);
      await instancia.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (textoDecodificado) => {
          instancia.stop().catch(() => undefined);
          setCameraAtiva(false);
          aoLer(textoDecodificado);
        },
        () => undefined,
      );
    } catch {
      setCameraAtiva(false);
      setErroCamera('Não foi possível acessar a câmera. Digite ou cole abaixo o código exibido na tela do cliente.');
    }
  }

  async function pararCamera() {
    if (leitorRef.current?.isScanning) {
      await leitorRef.current.stop().catch(() => undefined);
    }
    setCameraAtiva(false);
  }

  function enviarManual(ev: FormEvent) {
    ev.preventDefault();
    if (!codigoManual.trim()) return;
    aoLer(codigoManual.trim());
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        {!cameraAtiva ? (
          <Botao type="button" variante="secundario" icone="photo_camera" onClick={iniciarCamera}>
            Ler QR Code com a Câmera
          </Botao>
        ) : (
          <Botao type="button" variante="perigo" icone="stop" onClick={pararCamera}>
            Fechar Câmera
          </Botao>
        )}
        <span className="text-sm text-on-surface-variant">
          Ou digite/cole o código alfanumérico exibido pelo cliente:
        </span>
      </div>

      {erroCamera && <Alerta tipo="aviso">{erroCamera}</Alerta>}

      <div
        id={`qr-reader-${idElemento}`}
        className={cameraAtiva ? 'mx-auto w-full max-w-xs overflow-hidden rounded-xl border border-outline-variant' : 'hidden'}
      />

      <form onSubmit={enviarManual} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <Campo
          className="flex-1"
          rotulo="Código do QR Code do Atendimento"
          icone="qr_code"
          placeholder="Ex.: a1b2c3d4... ou VIAMOS:id:codigo"
          value={codigoManual}
          onChange={(e) => setCodigoManual(e.target.value)}
          required
        />
        <Botao type="submit" icone="fact_check" carregando={carregando} disabled={!codigoManual.trim()}>
          Validar Check-in
        </Botao>
      </form>
    </div>
  );
}
