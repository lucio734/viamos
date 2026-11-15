/**
 * RENDERIZAÇÃO — converte as fontes Mermaid (.mmd) em PNG com o Mermaid CLI (mmdc).
 * Usa o Chrome ou o Edge já instalado na máquina (não baixa navegador): defina PUPPETEER_EXECUTABLE_PATH
 * para apontar outro executável.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, openSync, readSync, closeSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const MMDC = join(AQUI, '..', 'node_modules', '@mermaid-js', 'mermaid-cli', 'src', 'cli.js');

/** Tema neutro (tons de cinza): as figuras continuam legíveis se o documento for impresso em preto e branco. */
// Fonte de 18 px com espaçamento enxuto: medido nas 29 figuras, é o que deixa mais texto legível quando a
// figura é reduzida para caber na página A4 (ver ajusteA4). O diagrama de sequência não herda o fontSize do
// tema, por isso os tamanhos dele são definidos à parte.
const TAMANHO_FONTE_PX = 18;
const CONFIG_MERMAID = {
  theme: 'neutral',
  themeVariables: { fontFamily: 'Arial, Helvetica, sans-serif', fontSize: `${TAMANHO_FONTE_PX}px` },
  flowchart: { useMaxWidth: false, htmlLabels: true, nodeSpacing: 18, rankSpacing: 32, wrappingWidth: 460 },
  er: { useMaxWidth: false },
  sequence: {
    useMaxWidth: false,
    mirrorActors: false,
    messageMargin: 22,
    noteMargin: 6,
    actorMargin: 24,
    width: 130,
    boxMargin: 6,
    actorFontSize: TAMANHO_FONTE_PX,
    messageFontSize: TAMANHO_FONTE_PX,
    noteFontSize: TAMANHO_FONTE_PX,
  },
};

/**
 * Tamanho aproximado do texto (em pontos) quando a figura ocupa uma página A4 inteira com margens de 2 cm,
 * na orientação que melhor a acomoda. Serve para vigiar a legibilidade: abaixo de ~5 pt a figura pede zoom.
 */
export function ajusteA4({ largura, altura }, escala = 2) {
  const [w, h] = [largura / escala, altura / escala];
  const AREA = { maior: 728, menor: 482 }; // A4 menos margens, em pontos
  const retrato = Math.min(AREA.menor / w, AREA.maior / h);
  const paisagem = Math.min(AREA.maior / w, AREA.menor / h);
  const fator = Math.min(1, Math.max(retrato, paisagem));
  return { orientacao: paisagem > retrato ? 'paisagem' : 'retrato', pontos: Math.round(TAMANHO_FONTE_PX * 0.75 * fator * 10) / 10 };
}

function acharNavegador() {
  const candidatos = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean);
  return candidatos.find((c) => existsSync(c)) ?? null;
}

/** Lê largura e altura do cabeçalho IHDR de um PNG. */
export function dimensoesPng(arquivo) {
  const fd = openSync(arquivo, 'r');
  const buf = Buffer.alloc(24);
  readSync(fd, buf, 0, 24, 0);
  closeSync(fd);
  return { largura: buf.readUInt32BE(16), altura: buf.readUInt32BE(20) };
}

function executar(args) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [MMDC, ...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let saida = '';
    p.stdout.on('data', (d) => (saida += d));
    p.stderr.on('data', (d) => (saida += d));
    p.on('close', (codigo) => resolve({ codigo, saida }));
  });
}

export async function renderizar({ pastaFontes, pastaFiguras, ids, paralelo = 3, escala = 2 }) {
  if (!existsSync(MMDC)) throw new Error('Mermaid CLI não instalado. Rode `npm install` em docs/diagramas.');
  const navegador = acharNavegador();
  if (!navegador) throw new Error('Chrome/Edge não encontrado. Defina PUPPETEER_EXECUTABLE_PATH com o caminho do navegador.');
  mkdirSync(pastaFiguras, { recursive: true });
  const trabalho = mkdtempSync(join(tmpdir(), 'viamos-diagramas-'));
  const arquivoConfig = join(trabalho, 'mermaid.json');
  const arquivoPuppeteer = join(trabalho, 'puppeteer.json');
  writeFileSync(arquivoConfig, JSON.stringify(CONFIG_MERMAID));
  writeFileSync(arquivoPuppeteer, JSON.stringify({ executablePath: navegador, args: ['--no-sandbox'] }));

  const fila = [...ids];
  const resultados = [];
  const trabalhador = async () => {
    for (let id = fila.shift(); id; id = fila.shift()) {
      const saida = join(pastaFiguras, `${id}.png`);
      // Sem --size: a figura sai no tamanho natural do diagrama, multiplicado pela escala (2 = nítido para impressão).
      const { codigo, saida: log } = await executar(['-i', join(pastaFontes, `${id}.mmd`), '-o', saida, '-b', 'white', '-s', String(escala), '-c', arquivoConfig, '-p', arquivoPuppeteer, '-q']);
      if (codigo !== 0 || !existsSync(saida)) resultados.push({ id, ok: false, erro: log.trim().split('\n').slice(0, 6).join('\n') });
      else resultados.push({ id, ok: true, ...dimensoesPng(saida) });
    }
  };
  await Promise.all(Array.from({ length: paralelo }, trabalhador));
  rmSync(trabalho, { recursive: true, force: true });
  return { navegador, resultados: resultados.sort((a, b) => a.id.localeCompare(b.id)) };
}
