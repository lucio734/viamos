/**
 * Componentes básicos fiéis ao Víamos Design System (botões, campos, cartões, chips, estados).
 * Item #32: Spinner (carregando), EstadoVazio, EstadoErro e Alerta de sucesso prontos para todas as telas.
 */
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';

export function Icone({ nome, className = '', preenchido = false }: { nome: string; className?: string; preenchido?: boolean }) {
  return (
    <span aria-hidden="true" className={`material-symbols-outlined ${preenchido ? 'preenchido' : ''} ${className}`}>
      {nome}
    </span>
  );
}

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'primario' | 'secundario' | 'perigo'; carregando?: boolean; icone?: string; largo?: boolean };
export function Botao({ variante = 'primario', carregando, icone, largo, className = '', children, disabled, ...rest }: BotaoProps) {
  const base = variante === 'primario' ? 'btn-primario' : variante === 'secundario' ? 'btn-secundario' : 'btn-perigo';
  return (
    <button className={`${base} ${largo ? 'w-full' : ''} ${className}`} disabled={disabled || carregando} aria-busy={carregando} {...rest}>
      {carregando ? <Spinner pequeno /> : icone ? <Icone nome={icone} className="text-[20px]" /> : null}
      {children}
    </button>
  );
}

type CampoProps = InputHTMLAttributes<HTMLInputElement> & { rotulo: string; erro?: string; ajuda?: string; icone?: string };
export function Campo({ rotulo, erro, ajuda, icone, id, className = '', ...rest }: CampoProps) {
  const campoId = id ?? rest.name ?? rotulo.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className={className}>
      <label htmlFor={campoId} className="rotulo">
        {rotulo}
      </label>
      <div className="relative">
        {icone && <Icone nome={icone} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-outline" />}
        <input id={campoId} className={`campo ${icone ? 'pl-11' : ''} ${erro ? 'campo-erro' : ''}`} aria-invalid={Boolean(erro)} aria-describedby={erro ? `${campoId}-erro` : ajuda ? `${campoId}-ajuda` : undefined} {...rest} />
      </div>
      {erro ? (
        <p id={`${campoId}-erro`} role="alert" className="mt-1 text-sm text-error">
          {erro}
        </p>
      ) : ajuda ? (
        <p id={`${campoId}-ajuda`} className="mt-1 text-sm text-on-surface-variant">
          {ajuda}
        </p>
      ) : null}
    </div>
  );
}

type AreaTextoProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { rotulo: string; erro?: string };
export function AreaTexto({ rotulo, erro, id, maxLength, value, ...rest }: AreaTextoProps) {
  const campoId = id ?? rest.name ?? 'area';
  return (
    <div>
      <label htmlFor={campoId} className="rotulo">
        {rotulo}
      </label>
      <textarea id={campoId} className={`campo min-h-24 ${erro ? 'campo-erro' : ''}`} maxLength={maxLength} value={value} {...rest} />
      <div className="mt-1 flex justify-between text-sm">
        {erro ? <span className="text-error">{erro}</span> : <span />}
        {maxLength && <span className="text-on-surface-variant">{String(value ?? '').length}/{maxLength}</span>}
      </div>
    </div>
  );
}

type SelecaoProps = SelectHTMLAttributes<HTMLSelectElement> & { rotulo: string; erro?: string; opcoes: { valor: string; rotulo: string }[] };
export function Selecao({ rotulo, erro, opcoes, id, ...rest }: SelecaoProps) {
  const campoId = id ?? rest.name ?? 'selecao';
  return (
    <div>
      <label htmlFor={campoId} className="rotulo">
        {rotulo}
      </label>
      <select id={campoId} className={`campo ${erro ? 'campo-erro' : ''}`} {...rest}>
        {opcoes.map((o) => (
          <option key={o.valor} value={o.valor}>
            {o.rotulo}
          </option>
        ))}
      </select>
      {erro && <p className="mt-1 text-sm text-error">{erro}</p>}
    </div>
  );
}

export function Cartao({ children, className = '', titulo, acao }: { children: ReactNode; className?: string; titulo?: string; acao?: ReactNode }) {
  return (
    <section className={`cartao ${className}`}>
      {(titulo || acao) && (
        <header className="mb-3 flex items-center justify-between gap-2">
          {titulo && <h2 className="text-lg font-semibold text-on-surface">{titulo}</h2>}
          {acao}
        </header>
      )}
      {children}
    </section>
  );
}

const CORES_CHIP: Record<string, string> = {
  BUSCANDO: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  ACEITA: 'bg-primary-fixed text-on-primary-fixed',
  AGENDADO: 'bg-primary-fixed text-on-primary-fixed',
  EM_ANDAMENTO: 'bg-status-online/15 text-status-online',
  CONCLUIDA: 'bg-secondary-container text-on-secondary-container',
  CONCLUIDO: 'bg-secondary-container text-on-secondary-container',
  CANCELADA: 'bg-error-container text-on-error-container',
  CANCELADO: 'bg-error-container text-on-error-container',
  URGENTE: 'bg-error-container text-on-error-container',
  APROVADO: 'bg-status-online/15 text-status-online',
  EM_ANALISE: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  PAGO: 'bg-status-online/15 text-status-online',
  PENDENTE: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  FALHOU: 'bg-error-container text-on-error-container',
};
export function Chip({ status, children }: { status: string; children: ReactNode }) {
  return <span className={`chip ${CORES_CHIP[status] ?? 'bg-surface-container-high text-on-surface-variant'}`}>{children}</span>;
}

export function Spinner({ pequeno = false, rotulo = 'Carregando' }: { pequeno?: boolean; rotulo?: string }) {
  return <span role="status" aria-label={rotulo} className={`inline-block animate-spin rounded-full border-current border-t-transparent ${pequeno ? 'size-5 border-2' : 'size-9 border-4 text-primary-container'}`} />;
}

export function Carregando({ texto = 'Carregando…' }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-on-surface-variant">
      <Spinner />
      <p>{texto}</p>
    </div>
  );
}

export function EstadoVazio({ icone = 'inbox', titulo, descricao, acao }: { icone?: string; titulo: string; descricao?: string; acao?: ReactNode }) {
  return (
    <div className="cartao flex flex-col items-center gap-2 py-10 text-center">
      <Icone nome={icone} className="text-5xl text-outline" />
      <h3 className="text-lg font-semibold">{titulo}</h3>
      {descricao && <p className="max-w-sm text-on-surface-variant">{descricao}</p>}
      {acao && <div className="mt-3">{acao}</div>}
    </div>
  );
}

export function EstadoErro({ mensagem, aoTentarNovamente }: { mensagem: string; aoTentarNovamente?: () => void }) {
  return (
    <div role="alert" className="cartao flex flex-col items-center gap-2 border-error/40 bg-error-container/40 py-8 text-center">
      <Icone nome="error" className="text-4xl text-error" />
      <p className="font-semibold text-on-error-container">{mensagem}</p>
      {aoTentarNovamente && (
        <Botao variante="secundario" onClick={aoTentarNovamente} icone="refresh">
          Tentar novamente
        </Botao>
      )}
    </div>
  );
}

export function Alerta({ tipo = 'info', children }: { tipo?: 'info' | 'sucesso' | 'erro' | 'aviso'; children: ReactNode }) {
  const estilos = {
    info: 'bg-primary-fixed text-on-primary-fixed',
    sucesso: 'bg-status-online/15 text-status-online',
    erro: 'bg-error-container text-on-error-container',
    aviso: 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  }[tipo];
  const icone = { info: 'info', sucesso: 'check_circle', erro: 'error', aviso: 'warning' }[tipo];
  return (
    <div role={tipo === 'erro' ? 'alert' : 'status'} className={`flex items-start gap-2 rounded-lg px-4 py-3 ${estilos}`}>
      <Icone nome={icone} className="mt-0.5 text-[20px]" />
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
