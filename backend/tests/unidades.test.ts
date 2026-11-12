/**
 * Testes unitários das regras puras (sem banco): geolocalização, documentos, estimativa e cobrança.
 */
import { describe, expect, it } from 'vitest';
import { cnpjValido, cpfValido, mascararDocumento, telefoneValido } from '../src/utils/documentos.js';
import { distanciaKm, distanciaMetros } from '../src/utils/geo.js';
import { calcularEstimativa } from '../src/services/solicitacao.service.js';
import { calcularValorFinal } from '../src/services/atendimento.service.js';
import { creditoInterprete } from '../src/services/pagamento.service.js';
import { semanaCorrente } from '../src/utils/datas.js';

describe('Geolocalização (RF17, RF32)', () => {
  it('Haversine: Av. Paulista → Hospital das Clínicas ≈ 1,5 km; mesmo ponto = 0', () => {
    const paulista = { latitude: -23.5614, longitude: -46.6559 };
    const hc = { latitude: -23.5569, longitude: -46.6697 };
    expect(distanciaKm(paulista, hc)).toBeGreaterThan(1.3);
    expect(distanciaKm(paulista, hc)).toBeLessThan(1.7);
    expect(distanciaMetros(hc, hc)).toBe(0);
  });
  it('0,001° de latitude ≈ 111 m (base do limite de 200 m do check-in)', () => {
    const m = distanciaMetros({ latitude: -23.5569, longitude: -46.6697 }, { latitude: -23.5579, longitude: -46.6697 });
    expect(Math.round(m)).toBeGreaterThanOrEqual(110);
    expect(Math.round(m)).toBeLessThanOrEqual(112);
  });
});

describe('Documentos brasileiros (item #33 no servidor)', () => {
  it('valida CPF com e sem máscara e rejeita sequências repetidas', () => {
    expect(cpfValido('529.982.247-25')).toBe(true);
    expect(cpfValido('52998224725')).toBe(true);
    expect(cpfValido('111.111.111-11')).toBe(false);
    expect(cpfValido('123.456.789-00')).toBe(false);
  });
  it('valida CNPJ e telefone; mascara documento para exibição', () => {
    expect(cnpjValido('11.222.333/0001-81')).toBe(true);
    expect(cnpjValido('11.222.333/0001-00')).toBe(false);
    expect(telefoneValido('(11) 98888-7777')).toBe(true);
    expect(telefoneValido('123')).toBe(false);
    expect(mascararDocumento('52998224725')).toBe('529.***.***-25');
  });
});

describe('Estimativa (RF15) e cobrança final (RF33 / D-03)', () => {
  it('regra v1: saúde 90 min = 142,50 + 15 + 10% = 171,75', () => {
    const e = calcularEstimativa({ tipoServico: 'SAUDE', duracaoPrevistaMin: 90 });
    expect(e.valorServico).toBe(142.5);
    expect(e.taxaPlataforma).toBe(14.25);
    expect(e.valorTotal).toBe(171.75);
  });
  it('rejeita duração abaixo do mínimo, acima do máximo e fora do bloco de 30 min', () => {
    expect(() => calcularEstimativa({ tipoServico: 'OUTRO', duracaoPrevistaMin: 30 })).toThrow();
    expect(() => calcularEstimativa({ tipoServico: 'OUTRO', duracaoPrevistaMin: 13 * 60 })).toThrow();
    expect(() => calcularEstimativa({ tipoServico: 'OUTRO', duracaoPrevistaMin: 100 })).toThrow();
  });
  it('duração real menor cobra o mínimo contratado; maior cobra excedente em blocos de 30 min', () => {
    const cotacao = { valorServico: 95, valorDeslocamento: 15, taxaPlataforma: 9.5, valorTotal: 119.5 };
    const menor = calcularValorFinal(cotacao, 60, 40)!;
    expect(menor.duracaoCobradaMin).toBe(60);
    expect(menor.valorTotal).toBe(119.5);
    const maior = calcularValorFinal(cotacao, 60, 75)!; // 75 → arredonda para 90 min
    expect(maior.duracaoCobradaMin).toBe(90);
    expect(maior.valorServico).toBe(142.5);
    expect(maior.valorTotal).toBe(171.75);
  });
  it('crédito ao intérprete = total − taxa da plataforma', () => {
    expect(creditoInterprete(119.5, 15)).toBe(110); // 95 + 15
    expect(creditoInterprete(171.75, 15)).toBe(157.5);
  });
  it('semana financeira começa na segunda-feira', () => {
    const { inicio, fim } = semanaCorrente(new Date('2026-11-12T15:00:00Z')); // quinta-feira
    expect(inicio.toISOString()).toBe('2026-11-09T00:00:00.000Z');
    expect(fim.toISOString()).toBe('2026-11-16T00:00:00.000Z');
  });
});
