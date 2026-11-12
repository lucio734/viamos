/**
 * VIEW (documento) — renderização do Comprovante de Acessibilidade Garantida em PDF (RF37, RNF41).
 * Recebe dados já preparados pelo service e devolve um Buffer. Não acessa o banco.
 */
import PDFDocument from 'pdfkit';
import { formatarDataBR, formatarDataHoraBR, formatarMoedaBR } from '../utils/datas.js';

export interface DadosComprovante {
  codigoVerificacao: string;
  emitidoEm: Date;
  urlVerificacao: string;
  atendimento: {
    id: string;
    tipoServicoRotulo: string;
    endereco: string;
    complemento?: string | null;
    inicioPrevisto: Date;
    inicioReal?: Date | null;
    fimReal?: Date | null;
    duracaoPrevistaMin: number;
    duracaoRealMin?: number | null;
    valorFinal?: number | null;
  };
  cliente: { nome: string; documentoMascarado: string };
  interprete: { nome: string; documentoMascarado: string; certificacao: string; especialidades: string[] };
  pagamento: { meio?: string | null; confirmadoEm?: Date | null; referencia?: string | null };
}

const AZUL = '#1a2e44';
const CINZA = '#43474d';

export function gerarPdfComprovante(d: DadosComprovante): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, info: { Title: 'Comprovante de Acessibilidade Garantida — Víamos', Author: 'Víamos' } });
    const partes: Buffer[] = [];
    doc.on('data', (c: Buffer) => partes.push(c));
    doc.on('end', () => resolve(Buffer.concat(partes)));
    doc.on('error', reject);

    // Cabeçalho
    doc.rect(0, 0, doc.page.width, 110).fill(AZUL);
    doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(24).text('Víamos', 50, 36);
    doc.font('Helvetica').fontSize(12).text('Comprovante de Acessibilidade Garantida', 50, 66);
    doc.fontSize(9).text('Interpretação em Libras — atendimento presencial', 50, 84);

    doc.moveDown(4);
    doc.fillColor(CINZA).fontSize(10).text(`Código de verificação: ${d.codigoVerificacao}`, 50, 130);
    doc.text(`Emitido em: ${formatarDataHoraBR(d.emitidoEm)}`);
    doc.text(`Verifique a autenticidade em: ${d.urlVerificacao}`);

    const secao = (titulo: string) => {
      doc.moveDown(1.2);
      doc.fillColor(AZUL).font('Helvetica-Bold').fontSize(13).text(titulo);
      doc.moveTo(50, doc.y + 2).lineTo(doc.page.width - 50, doc.y + 2).strokeColor('#c4c6cd').stroke();
      doc.moveDown(0.6);
      doc.fillColor('#1b1c1d').font('Helvetica').fontSize(11);
    };
    const linha = (rotulo: string, valor: string) => {
      doc.font('Helvetica-Bold').text(`${rotulo}: `, { continued: true }).font('Helvetica').text(valor);
    };

    secao('Atendimento');
    linha('Identificador', d.atendimento.id);
    linha('Tipo de serviço', d.atendimento.tipoServicoRotulo);
    linha('Local', `${d.atendimento.endereco}${d.atendimento.complemento ? ` — ${d.atendimento.complemento}` : ''}`);
    linha('Data', formatarDataBR(d.atendimento.inicioReal ?? d.atendimento.inicioPrevisto));
    linha('Início previsto', formatarDataHoraBR(d.atendimento.inicioPrevisto));
    if (d.atendimento.inicioReal) linha('Início real (check-in)', formatarDataHoraBR(d.atendimento.inicioReal));
    if (d.atendimento.fimReal) linha('Término', formatarDataHoraBR(d.atendimento.fimReal));
    linha('Duração contratada', `${d.atendimento.duracaoPrevistaMin} min`);
    if (d.atendimento.duracaoRealMin) linha('Duração realizada', `${d.atendimento.duracaoRealMin} min`);

    secao('Profissional');
    linha('Intérprete de Libras', d.interprete.nome);
    linha('Documento', d.interprete.documentoMascarado);
    linha('Certificação', d.interprete.certificacao);
    if (d.interprete.especialidades.length) linha('Especialidades', d.interprete.especialidades.join(', '));

    secao('Contratante');
    linha('Nome', d.cliente.nome);
    linha('Documento', d.cliente.documentoMascarado);

    secao('Pagamento');
    if (d.atendimento.valorFinal != null) linha('Valor', formatarMoedaBR(d.atendimento.valorFinal));
    if (d.pagamento.meio) linha('Meio', d.pagamento.meio === 'PIX' ? 'Pix' : 'Cartão de crédito');
    if (d.pagamento.confirmadoEm) linha('Confirmado em', formatarDataHoraBR(d.pagamento.confirmadoEm));
    if (d.pagamento.referencia) linha('Referência', d.pagamento.referencia);

    doc.moveDown(2);
    doc.fontSize(9).fillColor(CINZA).text(
      'Este documento comprova a prestação de serviço presencial de interpretação em Libras intermediado pela plataforma Víamos, ' +
        'em observância à Lei 10.436/2002, ao Decreto 5.626/2005 e à Lei 13.146/2015 (Lei Brasileira de Inclusão). ' +
        'A autenticidade pode ser conferida pelo código de verificação acima.',
      { align: 'justify' },
    );

    doc.end();
  });
}
