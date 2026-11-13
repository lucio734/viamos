import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { formato, mascaras, paraIso } from '../src/utils/formato.ts';
import {
  cepValido,
  CERTIFICADO_TAMANHO_MAX,
  cnpjValido,
  cpfValido,
  documentoValido,
  emailValido,
  erroArquivoCertificado,
  erroSenha,
  idadeValida,
  telefoneValido,
} from '../src/utils/validacao.ts';

describe('Máscaras e formatadores pt-BR (frontend/src/utils/formato.ts)', () => {
  it('aplica máscara de CPF, CNPJ e documento dinâmico', () => {
    assert.equal(mascaras.cpf('71428793860'), '714.287.938-60');
    assert.equal(mascaras.cnpj('11222333000181'), '11.222.333/0001-81');
    assert.equal(mascaras.documento('71428793860'), '714.287.938-60');
    assert.equal(mascaras.documento('11222333000181'), '11.222.333/0001-81');
  });

  it('aplica máscara de telefone fixo (10 dígitos) e celular (11 dígitos), CEP e cartão', () => {
    assert.equal(mascaras.telefone('1130911234'), '(11) 3091-1234');
    assert.equal(mascaras.telefone('11987654321'), '(11) 98765-4321');
    assert.equal(mascaras.cep('05403000'), '05403-000');
    assert.equal(mascaras.cartao('4111222233334444'), '4111 2222 3333 4444');
    assert.equal(mascaras.validade('1229'), '12/29');
  });

  it('formata moeda, duração, distância e converte data+hora para ISO', () => {
    assert.match(formato.moeda(150.5), /150,50/);
    assert.equal(formato.moeda(null), '—');
    assert.equal(formato.duracao(60), '1h');
    assert.equal(formato.duracao(90), '1h30');
    assert.equal(formato.duracao(45), '45 min');
    assert.equal(formato.distancia(0.45), '450 m');
    assert.equal(formato.distancia(3.25), '3,3 km');
    assert.match(paraIso('2026-11-20', '14:30'), /^2026-11-20T/);
  });
});

describe('Validações instantâneas de formulário (frontend/src/utils/validacao.ts)', () => {
  it('valida CPF e CNPJ pelos dígitos verificadores e rejeita sequências repetidas', () => {
    assert.equal(cpfValido('714.287.938-60'), true);
    assert.equal(cpfValido('111.111.111-11'), false);
    assert.equal(cpfValido('714.287.938-61'), false);
    assert.equal(cnpjValido('11.222.333/0001-81'), true);
    assert.equal(cnpjValido('00.000.000/0000-00'), false);
    assert.equal(documentoValido('71428793860'), true);
    assert.equal(documentoValido('11222333000181'), true);
    assert.equal(documentoValido('12345'), false);
  });

  it('valida telefone, CEP, e-mail e idade sem rollover de calendário (B-002)', () => {
    assert.equal(telefoneValido('(11) 98765-4321'), true);
    assert.equal(telefoneValido('119876'), false);
    assert.equal(cepValido('05403-000'), true);
    assert.equal(cepValido('05403'), false);
    assert.equal(emailValido('joao@viamos.app'), true);
    assert.equal(emailValido('invalido@'), false);
    assert.equal(idadeValida('1995-05-15'), true);
    assert.equal(idadeValida('2000-02-31'), false); // rollover bloqueado
    assert.equal(idadeValida('2020-01-01'), false); // menor de 16 anos
  });

  it('valida limites de senha do bcrypt (8 a 72 caracteres — B-003) e arquivo de certificado (RF05)', () => {
    assert.equal(erroSenha('1234567'), 'A senha deve ter pelo menos 8 caracteres.');
    assert.equal(erroSenha('SenhaValida123'), undefined);
    assert.equal(erroSenha('a'.repeat(73)), 'Senha muito longa (máximo 72 caracteres).');

    const pdfValido = { name: 'prolibras.pdf', type: 'application/pdf', size: 1024 } as File;
    const exeInvalido = { name: 'malware.exe', type: 'application/x-msdownload', size: 1024 } as File;
    const pdfGrande = { name: 'grande.pdf', type: 'application/pdf', size: CERTIFICADO_TAMANHO_MAX + 1 } as File;

    assert.equal(erroArquivoCertificado(pdfValido), undefined);
    assert.equal(erroArquivoCertificado(exeInvalido), 'Envie o certificado em PDF, JPG ou PNG.');
    assert.equal(erroArquivoCertificado(pdfGrande), 'O arquivo deve ter no máximo 5 MB.');
  });
});
