#!/usr/bin/env node
/**
 * Captura as telas do aplicativo (itens #4 e #5 da Produção Técnica) com o navegador automatizado.
 *
 * Pré-requisitos: API e frontend rodando localmente com o seed carregado
 *   (backend: npm run db:reset && npm run dev · frontend: npm run dev → http://localhost:5173)
 *   e as dependências de docs/diagramas instaladas (o Puppeteer vem com o Mermaid CLI).
 *
 * Uso (na raiz do repositório):
 *   node docs/producao-tecnica/build/capturar_telas.mjs [http://localhost:5173]
 *
 * Saída: docs/producao-tecnica/telas/<nn>-<nome>.png (celular 390×844 a 2×; backoffice em 1280×800).
 * Só usa as contas fictícias do seed (senha de demonstração documentada no README).
 */
import { mkdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const RAIZ = resolve(AQUI, '..', '..', '..');
const require = createRequire(join(RAIZ, 'docs', 'diagramas', 'package.json'));
const puppeteer = require('puppeteer');

const BASE = process.argv[2] ?? 'http://localhost:5173';
const SAIDA = join(RAIZ, 'docs', 'producao-tecnica', 'telas');
const SENHA = 'Viamos@2026';
const CELULAR = { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true };
const DESKTOP = { width: 1280, height: 800, deviceScaleFactor: 1.5 };
const NAVEGADORES = [
  process.env.PUPPETEER_EXECUTABLE_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].filter(Boolean);

async function api(caminho, token, opcoes = {}) {
  const resposta = await fetch(`${BASE}/api${caminho}`, {
    ...opcoes,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(opcoes.headers ?? {}) },
  });
  if (!resposta.ok) throw new Error(`${opcoes.method ?? 'GET'} ${caminho} → ${resposta.status}`);
  return resposta.json();
}

const entrar = async (email) => (await api('/auth/login', null, { method: 'POST', body: JSON.stringify({ email, senha: SENHA }) })).token;

/** Descobre, pela API, os identificadores do seed usados nas rotas com parâmetro. */
async function descobrirIds(t) {
  const historicoJoao = await api('/atendimentos', t.joao);
  const pago = historicoJoao.find((a) => a.status === 'CONCLUIDO' && a.pago);
  const pendente = historicoJoao.find((a) => a.status === 'CONCLUIDO' && !a.pago);
  const detalhePago = await api(`/atendimentos/${pago.id}`, t.joao);
  const aceitaAna = (await api('/solicitacoes?status=ACEITA', t.ana))[0];
  const agendadoAna = (await api(`/solicitacoes/${aceitaAna.id}`, t.ana)).atendimento.id;
  const demanda = (await api('/demandas', t.maria)).demandas[0];
  const concluidoMaria = (await api('/atendimentos', t.maria)).find((a) => a.status === 'CONCLUIDO');
  const certificacao = (await api('/backoffice/certificacoes', t.operador)).find((c) => c.status === 'EM_ANALISE');
  return {
    codigo: detalhePago.comprovante.codigoVerificacao,
    solicitacaoAceita: aceitaAna.id,
    atendimentoPago: pago.id,
    atendimentoPendente: pendente.id,
    atendimentoAgendado: agendadoAna,
    demanda: demanda.id,
    concluidoMaria: concluidoMaria?.id ?? pago.id,
    certificacao: certificacao.id,
  };
}

function telas(ids) {
  return [
    ['01-splash', '/', null],
    ['02-login', '/login', null],
    ['03-recuperar-senha', '/recuperar-senha', null],
    ['04-redefinir-senha', '/redefinir-senha/token-de-exemplo', null],
    ['05-selecao-de-perfil', '/cadastro', null],
    ['06-cadastro-cliente', '/cadastro/cliente', null],
    ['07-cadastro-interprete', '/cadastro/interprete', null],
    ['08-verificar-comprovante', `/verificar/${ids.codigo}`, null],
    ['09-hub-cliente', '/cliente', 'joao'],
    ['10-nova-solicitacao', '/cliente/solicitacoes/nova', 'joao'],
    ['11-acompanhamento-solicitacao', `/cliente/solicitacoes/${ids.solicitacaoAceita}`, 'ana'],
    ['12-detalhe-atendimento-cliente', `/cliente/atendimentos/${ids.atendimentoPago}`, 'joao'],
    ['13-sala-cliente', `/cliente/atendimentos/${ids.atendimentoAgendado}/sala`, 'ana'],
    ['14-pagamento', `/cliente/atendimentos/${ids.atendimentoPendente}/pagamento`, 'joao'],
    ['15-avaliar-interprete', `/cliente/atendimentos/${ids.atendimentoPago}/avaliar`, 'joao'],
    ['16-historico-cliente', '/cliente/historico', 'joao'],
    ['17-perfil-cliente', '/cliente/perfil', 'joao'],
    ['18-hub-interprete', '/interprete', 'maria'],
    ['19-demandas', '/interprete/demandas', 'maria'],
    ['20-detalhe-demanda', `/interprete/demandas/${ids.demanda}`, 'maria'],
    ['21-agenda', '/interprete/agenda', 'maria'],
    ['22-detalhe-atendimento-interprete', `/interprete/atendimentos/${ids.atendimentoAgendado}`, 'maria'],
    ['23-sala-interprete', `/interprete/atendimentos/${ids.atendimentoAgendado}/sala`, 'maria'],
    ['24-avaliar-cliente', `/interprete/atendimentos/${ids.concluidoMaria}/avaliar`, 'maria'],
    ['25-ganhos', '/interprete/ganhos', 'maria'],
    ['26-historico-interprete', '/interprete/historico', 'maria'],
    ['27-perfil-interprete', '/interprete/perfil', 'maria'],
    ['28-fila-certificacoes', '/backoffice', 'operador'],
    ['29-parecer-certificacao', `/backoffice/certificacoes/${ids.certificacao}`, 'operador'],
    ['30-chamados', '/backoffice/chamados', 'operador'],
    ['31-auditoria', '/backoffice/auditoria', 'operador'],
    ['32-notificacoes', '/notificacoes', 'joao'],
    ['33-suporte', '/suporte', 'joao'],
  ];
}

async function main() {
  mkdirSync(SAIDA, { recursive: true });
  const tokens = Object.fromEntries(
    await Promise.all(['joao', 'ana', 'maria', 'operador'].map(async (nome) => [nome, await entrar(`${nome}@viamos.app`)])),
  );
  const ids = await descobrirIds(tokens);
  const navegador = await puppeteer.launch({ executablePath: NAVEGADORES.find(Boolean), headless: true, args: ['--no-sandbox', '--lang=pt-BR'] });
  try {
    const filtro = process.argv[3] ? new RegExp(process.argv[3]) : null; // ex.: "01-splash" para refazer uma tela
    for (const [nome, rota, conta] of telas(ids).filter(([nome]) => !filtro || filtro.test(nome))) {
      const pagina = await navegador.newPage();
      await pagina.setViewport(conta === 'operador' ? DESKTOP : CELULAR);
      await pagina.emulateTimezone('America/Sao_Paulo');
      // a sessão fica no sessionStorage (RF08): grava o token antes de a aplicação carregar
      await pagina.evaluateOnNewDocument((token) => {
        if (token) sessionStorage.setItem('viamos.token', token);
      }, conta ? tokens[conta] : null);
      if (rota === '/') {
        // a splash redireciona sozinha para o login: captura assim que ela aparece
        await pagina.goto(`${BASE}${rota}`, { waitUntil: 'domcontentloaded', timeout: 60_000 });
        await pagina.waitForFunction(() => document.body.innerText.includes('Víamos'), { timeout: 10_000 });
        await new Promise((r) => setTimeout(r, 150));
      } else {
        await pagina.goto(`${BASE}${rota}`, { waitUntil: 'networkidle2', timeout: 60_000 });
        await new Promise((r) => setTimeout(r, 1500)); // mapas (OpenStreetMap) e ícones
      }
      await pagina.screenshot({ path: join(SAIDA, `${nome}.png`) });
      console.info(`${nome}.png  ${rota}${conta ? `  (${conta})` : ''}`);
      await pagina.close();
    }
  } finally {
    await navegador.close();
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
