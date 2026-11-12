/**
 * RF04 / RF05 / RF45 / RNF09 / RNF36 — Cadastro profissional do intérprete de Libras.
 * Protótipo de referência: Contexto/Arquivos Stitch/code (17).html ("Cadastro Profissional — Novo Cadastro"),
 * completo com endereço-base no mapa (Leaflet), raio de atuação (≤ 15 km), número e upload real do certificado
 * (clique ou arrastar/soltar, PDF/JPG/PNG ≤ 5 MB em base64) e consentimentos LGPD.
 */
import { useRef, useState, type DragEvent, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import { ICONE_TIPO_SERVICO, type Sessao, type TipoServico } from '../../api/tipos';
import { useAuth } from '../../auth/AuthContext';
import { CENTRO_PADRAO, geocodificar, Mapa, type Ponto } from '../../components/Mapa';
import { SecaoFormulario, TelaPublica } from '../../components/TelaPublica';
import { Alerta, Botao, Campo, Icone, Selecao } from '../../components/ui';
import { mascaras } from '../../utils/formato';
import {
  documentoValido,
  emailValido,
  erroArquivoCertificado,
  erroSenha,
  lerComoBase64,
  telefoneValido,
} from '../../utils/validacao';

const OPCOES_ESPECIALIDADE: { valor: TipoServico; rotulo: string }[] = [
  { valor: 'SAUDE', rotulo: 'Saúde / Médico' },
  { valor: 'JURIDICO', rotulo: 'Jurídico' },
  { valor: 'EDUCACAO', rotulo: 'Educação (Básico/Superior)' },
  { valor: 'EVENTO', rotulo: 'Conferências / Eventos' },
  { valor: 'OUTRO', rotulo: 'Atendimento Geral' },
];

export function CadastroInterprete() {
  const { registrarSessao } = useAuth();
  const navigate = useNavigate();
  const inputArquivoRef = useRef<HTMLInputElement>(null);

  const [nome, setNome] = useState('');
  const [documento, setDocumento] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [especialidades, setEspecialidades] = useState<TipoServico[]>(['SAUDE']);
  const [precoHora, setPrecoHora] = useState('95');
  const [raioKm, setRaioKm] = useState(10);
  const [enderecoBase, setEnderecoBase] = useState('');
  const [pontoBase, setPontoBase] = useState<Ponto>(CENTRO_PADRAO);
  const [buscandoEndereco, setBuscandoEndereco] = useState(false);
  const [avisoMapa, setAvisoMapa] = useState('');

  const [tipoCertificacao, setTipoCertificacao] = useState<'PROLIBRAS' | 'EQUIVALENTE'>('PROLIBRAS');
  const [numeroCertificacao, setNumeroCertificacao] = useState('');
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [arrastando, setArrastando] = useState(false);

  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceitePrivacidade, setAceitePrivacidade] = useState(false);

  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [cadastrado, setCadastrado] = useState(false);

  function alternarEspecialidade(tipo: TipoServico) {
    setEspecialidades((atual) => (atual.includes(tipo) ? atual.filter((t) => t !== tipo) : [...atual, tipo]));
  }

  function selecionarArquivo(f: File | null | undefined) {
    if (!f) return;
    const prob = erroArquivoCertificado(f);
    if (prob) {
      setErros((ant) => ({ ...ant, 'certificacao.arquivo': prob }));
      setArquivo(null);
      return;
    }
    setErros((ant) => {
      const copia = { ...ant };
      delete copia['certificacao.arquivo'];
      return copia;
    });
    setArquivo(f);
  }

  function aoSoltarArquivo(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setArrastando(false);
    selecionarArquivo(e.dataTransfer.files?.[0]);
  }

  async function localizarEnderecoNoMapa() {
    if (enderecoBase.trim().length < 5) {
      setErros((ant) => ({ ...ant, enderecoBase: 'Digite o endereço-base antes de buscar no mapa.' }));
      return;
    }
    setBuscandoEndereco(true);
    setAvisoMapa('');
    const achado = await geocodificar(enderecoBase);
    setBuscandoEndereco(false);
    if (achado) {
      setPontoBase(achado);
      setAvisoMapa('Ponto atualizado no mapa. Se precisar, arraste o marcador para ajustar.');
    } else {
      setAvisoMapa('Não foi possível localizar automaticamente. Toque diretamente no mapa para marcar seu ponto-base.');
    }
  }

  function validarFormulario(): Record<string, string> {
    const novos: Record<string, string> = {};
    if (nome.trim().length < 3) novos.nome = 'Informe o nome completo.';
    if (!documentoValido(documento)) novos.documento = 'Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.';
    if (!telefoneValido(telefone)) novos.telefone = 'Informe um telefone com DDD (10 ou 11 dígitos).';
    if (!emailValido(email)) novos.email = 'Informe um e-mail válido.';
    const probSenha = erroSenha(senha);
    if (probSenha) novos.senha = probSenha;
    if (especialidades.length === 0) novos.especialidades = 'Selecione ao menos uma especialidade.';
    const preco = Number(precoHora.replace(',', '.'));
    if (!Number.isFinite(preco) || preco <= 0 || preco > 2000) {
      novos.precoHora = 'Informe um valor/hora entre R$ 1,00 e R$ 2.000,00.';
    }
    if (enderecoBase.trim().length < 5) novos.enderecoBase = 'Informe o endereço-base de atuação.';
    if (numeroCertificacao.trim().length < 3) {
      novos['certificacao.numero'] = 'Informe o número ou código de registro do certificado.';
    }
    if (!arquivo) {
      novos['certificacao.arquivo'] = 'Anexe o certificado em PDF, JPG ou PNG (máx. 5 MB).';
    } else {
      const probArq = erroArquivoCertificado(arquivo);
      if (probArq) novos['certificacao.arquivo'] = probArq;
    }
    if (!aceiteTermos || !aceitePrivacidade) {
      novos.aceiteTermos = 'É necessário aceitar os termos de uso e a política de privacidade (LGPD).';
    }
    return novos;
  }

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const novos = validarFormulario();
    setErros(novos);
    setErroGeral('');
    if (Object.keys(novos).length || !arquivo) return;

    setCarregando(true);
    try {
      const conteudoBase64 = await lerComoBase64(arquivo);
      const sessao = await api.post<Sessao>('/cadastro/interprete', {
        nome: nome.trim(),
        documento,
        email: email.trim(),
        telefone,
        senha,
        enderecoBase: enderecoBase.trim(),
        latitudeBase: pontoBase.lat,
        longitudeBase: pontoBase.lng,
        especialidades,
        precoHora: Number(precoHora.replace(',', '.')),
        raioKm,
        certificacao: {
          tipo: tipoCertificacao,
          numero: numeroCertificacao.trim(),
          arquivo: {
            nome: arquivo.name,
            mime: arquivo.type,
            conteudoBase64,
          },
        },
        aceiteTermos,
        aceitePrivacidade,
      });
      registrarSessao(sessao);
      setCadastrado(true);
    } catch (erro) {
      if (erro instanceof ErroApi) {
        setErroGeral(erro.mensagem);
        setErros(erro.porCampo);
      } else {
        setErroGeral('Não foi possível concluir o cadastro agora. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <TelaPublica
      sobretitulo="Cadastro Profissional"
      titulo="Novo Cadastro"
      subtitulo="Preencha os dados abaixo para se registrar como intérprete profissional de Libras na plataforma."
      voltarPara="/cadastro"
    >
      {cadastrado ? (
        <div className="flex flex-col gap-4">
          <Alerta tipo="sucesso">Cadastro profissional realizado com sucesso!</Alerta>
          <Alerta tipo="aviso">
            <strong>Documentação em análise (RF06):</strong> recebemos seu certificado ({tipoCertificacao}). Você já pode acessar o seu painel e configurar sua agenda, e passará a receber demandas presenciais assim que a equipe do Víamos aprovar a documentação.
          </Alerta>
          <Botao type="button" largo icone="arrow_forward" onClick={() => navigate('/interprete', { replace: true })}>
            Ir para o painel do intérprete
          </Botao>
        </div>
      ) : (
        <form onSubmit={enviar} noValidate className="flex flex-col gap-6">
          {erroGeral && <Alerta tipo="erro">{erroGeral}</Alerta>}

          <SecaoFormulario titulo="Informações Pessoais" icone="badge">
              <Campo
                rotulo="Nome Completo"
                name="nome"
                autoComplete="name"
                maxLength={120}
                placeholder="Seu nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                erro={erros.nome}
                required
              />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo
                rotulo="CPF / CNPJ"
                name="documento"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={documento}
                onChange={(e) => setDocumento(mascaras.documento(e.target.value))}
                erro={erros.documento}
                required
              />
              <Campo
                rotulo="Telefone (com DDD)"
                name="telefone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="(11) 98888-7777"
                icone="call"
                value={telefone}
                onChange={(e) => setTelefone(mascaras.telefone(e.target.value))}
                erro={erros.telefone}
                required
              />
            </div>
            <Campo
              rotulo="E-mail"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="seu.email@exemplo.com"
              icone="mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              erro={erros.email}
              required
            />
            <div>
              <Campo
                rotulo="Senha"
                name="senha"
                type={mostrarSenha ? 'text' : 'password'}
                autoComplete="new-password"
                placeholder="Mínimo 8 caracteres"
                icone="lock"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                erro={erros.senha}
                required
              />
              <label className="mt-2 flex min-h-touch items-center gap-2 text-sm text-on-surface-variant">
                <input type="checkbox" checked={mostrarSenha} onChange={(e) => setMostrarSenha(e.target.checked)} className="size-4" />
                Mostrar senha
              </label>
            </div>
          </SecaoFormulario>

          <SecaoFormulario titulo="Perfil Profissional" icone="work">
            <div>
              <span className="rotulo">Especialidades de atuação (selecione uma ou mais)</span>
              <div role="group" aria-label="Especialidades de atuação" className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {OPCOES_ESPECIALIDADE.map((op) => {
                  const ativa = especialidades.includes(op.valor);
                  return (
                    <button
                      key={op.valor}
                      type="button"
                      aria-pressed={ativa}
                      onClick={() => alternarEspecialidade(op.valor)}
                      className={`flex min-h-touch items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm font-semibold transition ${
                        ativa
                          ? 'border-primary-container bg-primary-container text-on-primary'
                          : 'border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low'
                      }`}
                    >
                      <Icone nome={ICONE_TIPO_SERVICO[op.valor]} className="text-[20px]" />
                      <span className="flex-1">{op.rotulo}</span>
                      {ativa && <Icone nome="check_circle" className="text-[18px]" />}
                    </button>
                  );
                })}
              </div>
              {erros.especialidades && (
                <p role="alert" className="mt-1 text-sm text-error">
                  {erros.especialidades}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Campo
                rotulo="Preço Base por Hora (R$)"
                name="precoHora"
                type="number"
                inputMode="decimal"
                min={1}
                max={2000}
                step="0.01"
                placeholder="95,00"
                icone="payments"
                value={precoHora}
                onChange={(e) => setPrecoHora(e.target.value)}
                erro={erros.precoHora}
                required
              />
              <div>
                <label htmlFor="raio-km" className="rotulo flex justify-between">
                  <span>Raio de atuação</span>
                  <strong className="text-primary-container">{raioKm} km</strong>
                </label>
                <input
                  id="raio-km"
                  type="range"
                  min={1}
                  max={15}
                  value={raioKm}
                  onChange={(e) => setRaioKm(Number(e.target.value))}
                  className="mt-1 min-h-touch w-full accent-primary-container"
                />
                <p className="text-xs text-on-surface-variant">Máximo de 15 km conforme a regra de distribuição (RF17/RF24).</p>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Campo
                rotulo="Endereço-base de atuação"
                name="enderecoBase"
                className="flex-1"
                maxLength={200}
                placeholder="Ex.: Av. Paulista, 1578 - Bela Vista, São Paulo - SP"
                icone="location_on"
                value={enderecoBase}
                onChange={(e) => setEnderecoBase(e.target.value)}
                erro={erros.enderecoBase}
                required
              />
              <Botao
                type="button"
                variante="secundario"
                icone="search"
                carregando={buscandoEndereco}
                onClick={localizarEnderecoNoMapa}
              >
                Buscar no mapa
              </Botao>
            </div>
            {avisoMapa && <p className="text-xs text-on-surface-variant">{avisoMapa}</p>}

            <div>
              <span className="rotulo">Marque no mapa o ponto do seu endereço-base (círculo = raio de {raioKm} km)</span>
              <Mapa
                posicao={pontoBase}
                aoSelecionar={setPontoBase}
                raioKm={raioKm}
                rotulo="Mapa do endereço-base do intérprete"
              />
            </div>
          </SecaoFormulario>

          <SecaoFormulario titulo="Certificações (Prolibras ou Equivalente)" icone="verified">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Selecao
                rotulo="Tipo de certificação"
                name="tipoCertificacao"
                value={tipoCertificacao}
                onChange={(e) => setTipoCertificacao(e.target.value as 'PROLIBRAS' | 'EQUIVALENTE')}
                opcoes={[
                  { valor: 'PROLIBRAS', rotulo: 'Prolibras (MEC / INEP)' },
                  { valor: 'EQUIVALENTE', rotulo: 'Certificação equivalente reconhecida' },
                ]}
              />
              <Campo
                rotulo="Número / registro do certificado"
                name="numeroCertificacao"
                maxLength={60}
                placeholder="Ex.: PROLIBRAS-2023-00481"
                value={numeroCertificacao}
                onChange={(e) => setNumeroCertificacao(e.target.value)}
                erro={erros['certificacao.numero']}
                required
              />
            </div>

            {(() => {
              const erroArquivo =
                erros['certificacao.arquivo'] ??
                erros['certificacao.arquivo.conteudoBase64'] ??
                erros['certificacao.arquivo.nome'] ??
                erros['certificacao.arquivo.mime'];
              return (
                <div>
                  <span className="rotulo">Arquivo do certificado (PDF, JPG ou PNG — máx. 5 MB)</span>
                  <input
                    ref={inputArquivoRef}
                    id="arquivo-certificado"
                    type="file"
                    accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png"
                    className="sr-only"
                    onChange={(e) => selecionarArquivo(e.target.files?.[0])}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label="Selecionar ou soltar arquivo do certificado (PDF, JPG ou PNG até 5 MB)"
                    onClick={() => inputArquivoRef.current?.click()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        inputArquivoRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setArrastando(true);
                    }}
                    onDragLeave={() => setArrastando(false)}
                    onDrop={aoSoltarArquivo}
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition ${
                      arrastando
                        ? 'border-primary-container bg-primary-fixed/40'
                        : erroArquivo
                          ? 'border-error bg-error-container/20'
                          : 'border-outline-variant bg-surface-container-low hover:border-primary-container'
                    }`}
                  >
                    <Icone nome={arquivo ? 'description' : 'cloud_upload'} className="text-4xl text-primary-container" />
                    {arquivo ? (
                      <>
                        <p className="font-semibold text-on-surface">{arquivo.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {(arquivo.size / 1024).toFixed(0)} KB · Clique para trocar o arquivo
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="font-semibold text-on-surface">Clique para fazer upload ou arraste o arquivo aqui</p>
                        <p className="text-xs text-on-surface-variant">PDF, JPG ou PNG (Máx. 5 MB)</p>
                      </>
                    )}
                  </div>
                  {erroArquivo && (
                    <p role="alert" className="mt-1 text-sm text-error">
                      {erroArquivo}
                    </p>
                  )}
                </div>
              );
            })()}
          </SecaoFormulario>

          <SecaoFormulario titulo="Termos e Privacidade (LGPD)" icone="verified_user">
            <label className="flex min-h-touch items-start gap-3 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={aceiteTermos}
                onChange={(e) => setAceiteTermos(e.target.checked)}
                className="mt-1 size-5 shrink-0"
              />
              <span>
                Declaro que a documentação enviada é autêntica e aceito os Termos de Uso do Víamos, ciente de que a habilitação depende de validação pelo backoffice (RF06/RNF36).
              </span>
            </label>
            <label className="flex min-h-touch items-start gap-3 text-sm text-on-surface">
              <input
                type="checkbox"
                checked={aceitePrivacidade}
                onChange={(e) => setAceitePrivacidade(e.target.checked)}
                className="mt-1 size-5 shrink-0"
              />
              <span>
                Concordo com a Política de Privacidade e o tratamento dos meus dados pessoais e profissionais conforme a LGPD (Lei 13.709/2018).
              </span>
            </label>
            {erros.aceiteTermos && (
              <p role="alert" className="text-sm text-error">
                {erros.aceiteTermos}
              </p>
            )}
          </SecaoFormulario>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Link to="/cadastro" className="sm:w-1/3">
              <Botao type="button" variante="secundario" largo icone="arrow_back">
                Voltar
              </Botao>
            </Link>
            <Botao type="submit" className="sm:flex-1" largo carregando={carregando} icone="arrow_forward">
              Cadastrar
            </Botao>
          </div>
        </form>
      )}
    </TelaPublica>
  );
}
