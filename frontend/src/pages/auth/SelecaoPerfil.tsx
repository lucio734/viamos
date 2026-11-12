/**
 * RF02 — Seleção de tipo de perfil antes do cadastro (usuário surdo ou intérprete de Libras).
 * Alvos de toque amplos (≥ 44 px, RNF13) e linguagem direta (RNF15/RNF38).
 */
import { Link } from 'react-router-dom';
import { TelaPublica } from '../../components/TelaPublica';
import { Icone } from '../../components/ui';

export function SelecaoPerfil() {
  return (
    <TelaPublica
      titulo="Como você quer usar o Víamos?"
      subtitulo="Escolha o seu perfil para continuarmos com o cadastro adequado."
      voltarPara="/login"
    >
      <div className="flex flex-col gap-4">
        <Link
          to="/cadastro/cliente"
          className="cartao group flex items-start gap-4 border-2 border-transparent transition hover:border-primary-container focus-visible:border-primary-container"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary-fixed text-on-primary-fixed">
            <Icone nome="sign_language" className="text-3xl" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-on-surface">Sou pessoa surda (cliente)</h2>
              <Icone nome="arrow_forward" className="text-primary-container transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1 text-on-surface-variant">
              Quero solicitar intérpretes de Libras certificados para atendimentos presenciais em saúde, jurídico, educação ou eventos.
            </p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-on-primary-fixed">
              <li className="rounded-full bg-primary-fixed px-3 py-1">Valor estimado antes de confirmar</li>
              <li className="rounded-full bg-primary-fixed px-3 py-1">Check-in por QR Code</li>
              <li className="rounded-full bg-primary-fixed px-3 py-1">Comprovante em PDF</li>
            </ul>
          </div>
        </Link>

        <Link
          to="/cadastro/interprete"
          className="cartao group flex items-start gap-4 border-2 border-transparent transition hover:border-primary-container focus-visible:border-primary-container"
        >
          <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-tertiary-fixed text-on-tertiary-fixed-variant">
            <Icone nome="verified" className="text-3xl" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-on-surface">Sou intérprete de Libras</h2>
              <Icone nome="arrow_forward" className="text-primary-container transition group-hover:translate-x-0.5" />
            </div>
            <p className="mt-1 text-on-surface-variant">
              Possuo certificação Prolibras ou equivalente e quero receber demandas presenciais próximas ao meu endereço-base (até 15 km).
            </p>
            <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-on-tertiary-fixed-variant">
              <li className="rounded-full bg-tertiary-fixed px-3 py-1">Validação documental</li>
              <li className="rounded-full bg-tertiary-fixed px-3 py-1">Agenda e raio configuráveis</li>
              <li className="rounded-full bg-tertiary-fixed px-3 py-1">Repasse de ganhos</li>
            </ul>
          </div>
        </Link>
      </div>

      <p className="mt-8 text-center text-on-surface-variant">
        Já tem uma conta?{' '}
        <Link to="/login" className="inline-flex min-h-touch items-center px-2 font-semibold text-primary-container hover:underline">
          Entrar
        </Link>
      </p>
    </TelaPublica>
  );
}
