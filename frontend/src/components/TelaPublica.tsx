/**
 * Moldura das telas públicas (recuperar senha, seleção de perfil, cadastros), fiel aos protótipos Stitch
 * code (7).html e code (17).html: barra com botão "voltar" + marca Víamos, título, subtítulo e conteúdo
 * em coluna única (mobile-first, max-w-xl).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Icone } from './ui';

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Pequeno rótulo acima do título (ex.: "Cadastro Profissional" no protótipo do intérprete). */
  sobretitulo?: string;
  voltarPara?: string;
  children: ReactNode;
  largura?: 'md' | 'xl';
}

export function TelaPublica({ titulo, subtitulo, sobretitulo, voltarPara = '/login', children, largura = 'xl' }: Props) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="sticky top-0 z-[1100] flex h-14 items-center gap-2 border-b border-outline-variant/60 bg-surface-container-lowest px-2">
        <Link to={voltarPara} aria-label="Voltar" className="flex size-11 items-center justify-center rounded-full text-primary-container hover:bg-surface-container">
          <Icone nome="arrow_back" />
        </Link>
        <span className="text-xl font-bold text-primary-container">Víamos</span>
      </header>
      <main className={`mx-auto w-full ${largura === 'md' ? 'max-w-md' : 'max-w-xl'} px-5 py-6 pb-16`}>
        {sobretitulo && <p className="mb-1 text-sm font-semibold tracking-wide text-on-surface-variant uppercase">{sobretitulo}</p>}
        <h1 className="text-3xl font-bold text-on-surface">{titulo}</h1>
        {subtitulo && <p className="mt-2 text-on-surface-variant">{subtitulo}</p>}
        <div className="mt-6">{children}</div>
      </main>
    </div>
  );
}

/** Título de seção dentro de formulários longos ("Dados Pessoais", "Dados de Acesso"…), como nos protótipos. */
export function SecaoFormulario({ titulo, icone, children }: { titulo: string; icone?: string; children: ReactNode }) {
  return (
    <fieldset className="cartao flex flex-col gap-4">
      <legend className="sr-only">{titulo}</legend>
      <h2 aria-hidden="true" className="flex items-center gap-2 text-lg font-semibold text-primary-container">
        {icone && <Icone nome={icone} />} {titulo}
      </h2>
      {children}
    </fieldset>
  );
}
