/**
 * Página provisória para rotas do sitemap ainda não implementadas.
 * Mostra qual tela/RF a rota representa e qual endpoint já existe no backend — guia para quem for construí-la.
 */
import { Link, useLocation } from 'react-router-dom';
import { Botao, Icone } from '../components/ui';

export interface InfoTela {
  titulo: string;
  requisitos: string;
  endpoints: string[];
  prototipo?: string; // arquivo em docs/contexto/stitch
}

export function EmConstrucao({ info }: { info: InfoTela }) {
  const { pathname } = useLocation();
  return (
    <div className="cartao mx-auto max-w-xl">
      <div className="mb-3 flex items-center gap-2 text-primary-container">
        <Icone nome="construction" className="text-3xl" />
        <h1 className="text-2xl font-bold">{info.titulo}</h1>
      </div>
      <p className="text-on-surface-variant">
        Rota <code className="rounded bg-surface-container px-1">{pathname}</code> prevista no sitemap. Tela ainda não implementada.
      </p>
      <dl className="mt-4 space-y-2 text-sm">
        <div>
          <dt className="font-semibold">Requisitos</dt>
          <dd>{info.requisitos}</dd>
        </div>
        <div>
          <dt className="font-semibold">Endpoints do backend já prontos</dt>
          <dd>
            <ul className="list-disc pl-5">
              {info.endpoints.map((e) => (
                <li key={e}>
                  <code>{e}</code>
                </li>
              ))}
            </ul>
          </dd>
        </div>
        {info.prototipo && (
          <div>
            <dt className="font-semibold">Protótipo de referência</dt>
            <dd>
              <code>docs/contexto/stitch/{info.prototipo}</code>
            </dd>
          </div>
        )}
      </dl>
      <Link to="/" className="mt-5 inline-block">
        <Botao variante="secundario" icone="arrow_back">
          Voltar ao início
        </Botao>
      </Link>
    </div>
  );
}
