/**
 * Perfil, Habilitação Documental e Privacidade LGPD — Intérprete (RF04, RF05, RF43, RF45, protótipo Stitch code (11).html).
 * Inclui:
 *   - Upload/atualização da foto de perfil (RF04 — fecha a ressalva apontada pelo revisor_po)
 *   - Edição de endereço-base com Mapa interativo, especialidades e valor/hora (PUT /perfil)
 *   - Histórico de certificações Prolibras/equivalente + reenvio de certificado (GET/POST /interprete/certificacoes)
 *   - Alteração de senha (POST /auth/alterar-senha) e Direitos LGPD (consentimentos, exportar JSON, excluir conta)
 */
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ErroApi } from '../../api/cliente';
import {
  ROTULO_TIPO_SERVICO,
  type CertificacaoInterprete,
  type ConsentimentoItem,
  type TipoServico,
  type Usuario,
} from '../../api/tipos';
import { useAuth } from '../../auth/AuthContext';
import { CENTRO_PADRAO, geocodificar, Mapa, type Ponto } from '../../components/Mapa';
import { Alerta, Botao, Campo, Carregando, Cartao, Chip, EstadoErro, Icone, Selecao } from '../../components/ui';
import { formato, mascaras } from '../../utils/formato';
import { erroArquivoCertificado, erroSenha, lerComoBase64, telefoneValido } from '../../utils/validacao';

const TODAS_ESPECIALIDADES: TipoServico[] = ['SAUDE', 'EDUCACAO', 'JURIDICO', 'EVENTO', 'OUTRO'];

export function PerfilInterprete() {
  const { recarregar, sair } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState<Usuario | null>(null);
  const [certificacoes, setCertificacoes] = useState<CertificacaoInterprete[]>([]);
  const [consentimentos, setConsentimentos] = useState<ConsentimentoItem[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  // Edição do perfil profissional
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [enderecoBase, setEnderecoBase] = useState('');
  const [pontoBase, setPontoBase] = useState<Ponto>(CENTRO_PADRAO);
  const [especialidades, setEspecialidades] = useState<TipoServico[]>(['SAUDE']);
  const [precoHora, setPrecoHora] = useState('90');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Reenvio de certificação (RF05)
  const [exibirReenvio, setExibirReenvio] = useState(false);
  const [tipoCert, setTipoCert] = useState<'PROLIBRAS' | 'EQUIVALENTE'>('PROLIBRAS');
  const [numeroCert, setNumeroCert] = useState('');
  const [arquivoCert, setArquivoCert] = useState<File | null>(null);
  const [enviandoCert, setEnviandoCert] = useState(false);

  // Alterar senha
  const [exibirSenha, setExibirSenha] = useState(false);
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Exclusão LGPD
  const [confirmarExclusao, setConfirmarExclusao] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  const [mensagem, setMensagem] = useState('');
  const [erroAcao, setErroAcao] = useState('');
  const inputFotoRef = useRef<HTMLInputElement | null>(null);

  const carregar = useCallback(() => {
    setCarregando(true);
    setErro('');
    Promise.all([
      api.get<Usuario>('/perfil'),
      api.get<CertificacaoInterprete[]>('/interprete/certificacoes'),
      api.get<ConsentimentoItem[]>('/perfil/consentimentos'),
    ])
      .then(([u, certs, cons]) => {
        setPerfil(u);
        setCertificacoes(certs);
        setConsentimentos(cons);
        setNome(u.nome);
        setTelefone(mascaras.telefone(u.telefone));
        setFotoUrl(u.fotoUrl);
        if (u.interprete) {
          setEnderecoBase(u.interprete.enderecoBase);
          setPontoBase({ lat: u.interprete.latitudeBase, lng: u.interprete.longitudeBase });
          setEspecialidades(u.interprete.especialidades);
          setPrecoHora(String(u.interprete.precoHora));
        }
      })
      .catch((e) => setErro(e instanceof ErroApi ? e.mensagem : 'Falha ao carregar perfil do intérprete.'))
      .finally(() => setCarregando(false));
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function aoEscolherFotoPerfil(ev: ChangeEvent<HTMLInputElement>) {
    const arq = ev.target.files?.[0];
    ev.target.value = '';
    if (!arq) return;
    setErroAcao('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(arq.type)) {
      setErroAcao('Envie uma foto em JPG, PNG ou WebP.');
      return;
    }
    if (arq.size > 350_000) {
      setErroAcao('A foto de perfil deve ter no máximo 350 KB.');
      return;
    }
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result ?? ''));
      r.onerror = () => reject(new Error('Erro ao ler foto'));
      r.readAsDataURL(arq);
    });
    setFotoUrl(dataUrl);
    try {
      const atualizado = await api.put<Usuario>('/perfil', { fotoUrl: dataUrl });
      setPerfil(atualizado);
      await recarregar();
      setMensagem('Foto de perfil atualizada com sucesso (RF04).');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível salvar a foto.');
    }
  }

  function alternarEspecialidade(esp: TipoServico) {
    setEspecialidades((ant) => {
      if (ant.includes(esp)) {
        return ant.length > 1 ? ant.filter((x) => x !== esp) : ant;
      }
      return [...ant, esp];
    });
  }

  async function salvarDadosProfissionais(ev: FormEvent) {
    ev.preventDefault();
    setErroAcao('');
    setMensagem('');
    if (!telefoneValido(telefone)) {
      setErroAcao('Informe um telefone válido com DDD.');
      return;
    }
    const valorHoraNum = Number(precoHora.replace(',', '.'));
    if (Number.isNaN(valorHoraNum) || valorHoraNum <= 0 || valorHoraNum > 2000) {
      setErroAcao('Informe um valor/hora válido (entre R$ 1 e R$ 2.000).');
      return;
    }

    setSalvandoPerfil(true);
    try {
      const atualizado = await api.put<Usuario>('/perfil', {
        nome: nome.trim(),
        telefone,
        fotoUrl,
        interprete: {
          enderecoBase: enderecoBase.trim(),
          latitudeBase: pontoBase.lat,
          longitudeBase: pontoBase.lng,
          especialidades,
          precoHora: valorHoraNum,
        },
      });
      setPerfil(atualizado);
      setEditando(false);
      await recarregar();
      setMensagem('Dados profissionais atualizados com sucesso.');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível salvar os dados.');
    } finally {
      setSalvandoPerfil(false);
    }
  }

  async function reenviarCertificado(ev: FormEvent) {
    ev.preventDefault();
    setErroAcao('');
    setMensagem('');
    if (numeroCert.trim().length < 3) {
      setErroAcao('Informe o número ou código do certificado.');
      return;
    }
    const erroArq = erroArquivoCertificado(arquivoCert);
    if (erroArq || !arquivoCert) {
      setErroAcao(erroArq ?? 'Selecione o arquivo do certificado.');
      return;
    }

    setEnviandoCert(true);
    try {
      const conteudoBase64 = await lerComoBase64(arquivoCert);
      await api.post('/interprete/certificacoes', {
        tipo: tipoCert,
        numero: numeroCert.trim(),
        arquivo: {
          nome: arquivoCert.name,
          mime: arquivoCert.type,
          conteudoBase64,
        },
      });
      setMensagem('Novo certificado enviado para análise do backoffice (RF05).');
      setExibirReenvio(false);
      setNumeroCert('');
      setArquivoCert(null);
      carregar();
      await recarregar();
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao enviar certificado.');
    } finally {
      setEnviandoCert(false);
    }
  }

  async function salvarSenha(ev: FormEvent) {
    ev.preventDefault();
    setErroAcao('');
    const msg = erroSenha(novaSenha);
    if (msg) {
      setErroAcao(msg);
      return;
    }
    setSalvandoSenha(true);
    try {
      const res = await api.post<{ mensagem: string }>('/auth/alterar-senha', { senhaAtual, novaSenha });
      setMensagem(res.mensagem);
      setSenhaAtual('');
      setNovaSenha('');
      setExibirSenha(false);
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível alterar a senha.');
    } finally {
      setSalvandoSenha(false);
    }
  }

  async function alternarConsentimento(finalidade: ConsentimentoItem['finalidade'], concedido: boolean) {
    setErroAcao('');
    try {
      const lista = await api.put<ConsentimentoItem[]>('/perfil/consentimentos', { finalidade, concedido });
      setConsentimentos(lista);
      setMensagem('Consentimento atualizado.');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao atualizar consentimento.');
    }
  }

  async function exportarDados() {
    try {
      const dados = await api.get<unknown>('/perfil/dados/exportar');
      const blob = new Blob([JSON.stringify(dados, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'meus-dados-viamos.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMensagem('Dados pessoais exportados em JSON (LGPD).');
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Falha ao exportar dados.');
    }
  }

  async function excluirConta() {
    setExcluindo(true);
    setErroAcao('');
    try {
      await api.post('/perfil/dados/excluir');
      await sair();
      navigate('/login', { replace: true });
    } catch (e) {
      setErroAcao(e instanceof ErroApi ? e.mensagem : 'Não foi possível excluir a conta.');
      setExcluindo(false);
    }
  }

  if (carregando) return <Carregando texto="Carregando seu perfil profissional…" />;
  if (erro || !perfil) return <EstadoErro mensagem={erro || 'Perfil indisponível.'} aoTentarNovamente={carregar} />;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold text-primary">Meu Perfil e Habilitação</h1>

      {mensagem && <Alerta tipo="sucesso">{mensagem}</Alerta>}
      {erroAcao && <Alerta tipo="erro">{erroAcao}</Alerta>}

      {/* Cartão superior com Foto de Perfil (RF04 + code (11).html) */}
      <section className="flex flex-col items-start gap-5 rounded-xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-xs sm:flex-row sm:items-center">
        <div className="relative">
          {fotoUrl ? (
            <img
              src={fotoUrl}
              alt={`Foto de ${perfil.nome}`}
              className="size-24 rounded-full border-4 border-primary-fixed object-cover shadow-xs"
            />
          ) : (
            <div className="flex size-24 items-center justify-center rounded-full border-4 border-primary-fixed bg-primary-container text-3xl font-bold text-on-primary">
              {perfil.nome.charAt(0).toUpperCase()}
            </div>
          )}
          <input
            ref={inputFotoRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={aoEscolherFotoPerfil}
          />
          <button
            type="button"
            aria-label="Alterar foto de perfil"
            onClick={() => inputFotoRef.current?.click()}
            className="absolute -right-1 -bottom-1 flex size-9 items-center justify-center rounded-full bg-primary text-on-primary shadow-sm hover:bg-primary-container"
          >
            <Icone nome="photo_camera" className="text-[18px]" />
          </button>
        </div>

        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-2xl font-bold text-on-surface">{perfil.nome}</h2>
            {perfil.interprete && (
              <Chip status={perfil.interprete.statusHabilitacao}>
                {perfil.interprete.statusHabilitacao.replace('_', ' ')}
              </Chip>
            )}
          </div>
          <p className="text-base text-on-surface-variant">{perfil.email}</p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            {perfil.interprete?.documento && (
              <span className="rounded-full bg-surface-container-high px-3 py-1 text-xs font-semibold text-on-surface-variant">
                Doc.: {perfil.interprete.documento}
              </span>
            )}
            <span className="rounded-full bg-primary-fixed px-3 py-1 text-xs font-semibold text-on-primary-fixed">
              Valor/hora: {formato.moeda(perfil.interprete?.precoHora)}
            </span>
            <button
              type="button"
              onClick={() => setEditando((v) => !v)}
              className="min-h-touch px-2 text-sm font-semibold text-primary underline underline-offset-2"
            >
              {editando ? 'Cancelar edição' : 'Editar Dados Profissionais'}
            </button>
          </div>
        </div>
      </section>

      {/* Edição de Dados Profissionais */}
      {editando && (
        <Cartao titulo="Editar Perfil Profissional (RF04 / RF43)">
          <form onSubmit={salvarDadosProfissionais} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Campo rotulo="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
              <Campo
                rotulo="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(mascaras.telefone(e.target.value))}
                required
              />
              <Campo
                rotulo="Valor de referência por hora (R$)"
                type="number"
                min={1}
                max={2000}
                step="0.01"
                value={precoHora}
                onChange={(e) => setPrecoHora(e.target.value)}
                required
              />
            </div>

            <div>
              <span className="rotulo">Especialidades de atuação</span>
              <div className="flex flex-wrap gap-2">
                {TODAS_ESPECIALIDADES.map((esp) => {
                  const ativo = especialidades.includes(esp);
                  return (
                    <button
                      key={esp}
                      type="button"
                      aria-pressed={ativo}
                      onClick={() => alternarEspecialidade(esp)}
                      className={`min-h-touch rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        ativo
                          ? 'border-primary-container bg-primary-container text-on-primary'
                          : 'border-outline-variant bg-surface-container-lowest text-on-surface'
                      }`}
                    >
                      {ROTULO_TIPO_SERVICO[esp]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <Campo
                className="flex-1"
                rotulo="Endereço-base de partida"
                value={enderecoBase}
                onChange={(e) => setEnderecoBase(e.target.value)}
                required
              />
              <Botao
                type="button"
                variante="secundario"
                icone="travel_explore"
                onClick={async () => {
                  const p = await geocodificar(enderecoBase);
                  if (p) setPontoBase(p);
                }}
              >
                Localizar no mapa
              </Botao>
            </div>

            <Mapa
              posicao={pontoBase}
              aoSelecionar={setPontoBase}
              raioKm={perfil.interprete?.raioKm ?? 10}
              altura="h-56"
              rotulo="Clique ou arraste o pino para atualizar sua localização-base:"
            />

            <div className="flex justify-end gap-2">
              <Botao type="button" variante="secundario" onClick={() => setEditando(false)}>
                Cancelar
              </Botao>
              <Botao type="submit" icone="save" carregando={salvandoPerfil}>
                Salvar Alterações
              </Botao>
            </div>
          </form>
        </Cartao>
      )}

      {/* Certificações Prolibras / Equivalente (RF05 / RF06) */}
      <Cartao
        titulo="Certificações Prolibras e Habilitação (RF05)"
        acao={
          <Botao
            type="button"
            variante="secundario"
            icone={exibirReenvio ? 'close' : 'upload_file'}
            onClick={() => setExibirReenvio((v) => !v)}
          >
            {exibirReenvio ? 'Fechar' : 'Enviar Novo Certificado'}
          </Botao>
        }
      >
        <div className="flex flex-col gap-3">
          {certificacoes.map((c) => (
            <div
              key={c.id}
              className="flex flex-col justify-between gap-3 rounded-xl border border-outline-variant bg-surface-container-low p-4 sm:flex-row sm:items-center"
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-bold text-primary">
                    {c.tipo} · Nº {c.numero}
                  </p>
                  <Chip status={c.status === 'APROVADA' ? 'APROVADO' : c.status}>{c.status.replace('_', ' ')}</Chip>
                </div>
                <p className="text-sm text-on-surface-variant">
                  Arquivo: {c.nomeArquivo} ({Math.round(c.tamanhoBytes / 1024)} KB) · enviado em {formato.dataHora(c.enviadaEm)}
                </p>
                {c.motivoParecer && (
                  <p className="mt-1 text-sm font-medium text-on-surface">
                    Parecer do backoffice: <em>{c.motivoParecer}</em>
                  </p>
                )}
              </div>
              <Botao
                type="button"
                variante="secundario"
                icone="open_in_new"
                onClick={() => api.abrirArquivo(`/backoffice/certificacoes/${c.id}/arquivo`)}
              >
                Ver Documento
              </Botao>
            </div>
          ))}

          {exibirReenvio && (
            <form onSubmit={reenviarCertificado} className="mt-2 flex flex-col gap-4 rounded-xl border border-outline-variant bg-surface-container-lowest p-4">
              <h3 className="text-base font-semibold text-primary">Enviar / Atualizar Certificado (PDF, JPG ou PNG ≤ 5 MB)</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Selecao
                  rotulo="Tipo de certificação"
                  value={tipoCert}
                  onChange={(e) => setTipoCert(e.target.value as 'PROLIBRAS' | 'EQUIVALENTE')}
                  opcoes={[
                    { valor: 'PROLIBRAS', rotulo: 'Certificado Prolibras (MEC/INEP)' },
                    { valor: 'EQUIVALENTE', rotulo: 'Diploma / Certificação Equivalente Reconhecida' },
                  ]}
                />
                <Campo
                  rotulo="Número ou registro do certificado"
                  placeholder="Ex.: PRO-2024-8891"
                  value={numeroCert}
                  onChange={(e) => setNumeroCert(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="reenvio-cert" className="rotulo">
                  Arquivo comprobatório (PDF, JPG ou PNG até 5 MB)
                </label>
                <input
                  id="reenvio-cert"
                  type="file"
                  accept="application/pdf,image/jpeg,image/png"
                  onChange={(e) => setArquivoCert(e.target.files?.[0] ?? null)}
                  className="campo py-2"
                  required
                />
              </div>

              <div className="flex justify-end">
                <Botao type="submit" icone="send" carregando={enviandoCert}>
                  Enviar para Análise
                </Botao>
              </div>
            </form>
          )}
        </div>
      </Cartao>

      {/* Segurança e LGPD */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Cartao titulo="Segurança da Conta">
          <div className="flex flex-col gap-3">
            <Botao
              type="button"
              variante="secundario"
              icone="lock"
              onClick={() => setExibirSenha((v) => !v)}
            >
              {exibirSenha ? 'Ocultar formulário de senha' : 'Alterar Senha'}
            </Botao>

            {exibirSenha && (
              <form onSubmit={salvarSenha} className="flex flex-col gap-3 rounded-lg bg-surface-container-low p-3">
                <Campo
                  rotulo="Senha atual"
                  type="password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                  required
                />
                <Campo
                  rotulo="Nova senha (8 a 72 caracteres)"
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  required
                />
                <Botao type="submit" icone="key" carregando={salvandoSenha}>
                  Salvar Nova Senha
                </Botao>
              </form>
            )}

            <div className="mt-2 border-t border-outline-variant/60 pt-3">
              {!confirmarExclusao ? (
                <Botao type="button" variante="perigo" icone="delete_forever" onClick={() => setConfirmarExclusao(true)}>
                  Solicitar Exclusão da Conta (LGPD)
                </Botao>
              ) : (
                <div className="flex flex-col gap-2 rounded-lg bg-error-container/30 p-3">
                  <p className="text-sm text-on-error-container">
                    Sua conta será desativada e os dados pessoais anonimizados. Confirmar?
                  </p>
                  <div className="flex gap-2">
                    <Botao type="button" variante="perigo" carregando={excluindo} onClick={excluirConta}>
                      Confirmar Exclusão
                    </Botao>
                    <Botao type="button" variante="secundario" onClick={() => setConfirmarExclusao(false)}>
                      Cancelar
                    </Botao>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Cartao>

        <Cartao
          titulo="Privacidade e LGPD (RF45)"
          acao={
            <Botao type="button" variante="secundario" icone="download" onClick={exportarDados}>
              Exportar JSON
            </Botao>
          }
        >
          <div className="flex flex-col gap-2.5">
            {consentimentos.map((c) => {
              const obrigatorio = c.finalidade === 'TERMOS_USO' || c.finalidade === 'PRIVACIDADE';
              return (
                <div
                  key={c.finalidade}
                  className="flex items-center justify-between rounded-lg bg-surface-container-low p-3"
                >
                  <span className="text-sm font-semibold text-on-surface">{c.finalidade.replace('_', ' ')}</span>
                  {obrigatorio ? (
                    <span className="text-xs font-semibold text-status-online">Obrigatório</span>
                  ) : (
                    <button
                      type="button"
                      role="switch"
                      aria-checked={c.concedido}
                      onClick={() => alternarConsentimento(c.finalidade, !c.concedido)}
                      className={`min-h-touch rounded-full px-3 py-1 text-xs font-semibold ${
                        c.concedido ? 'bg-status-online text-white' : 'border border-outline bg-surface text-on-surface'
                      }`}
                    >
                      {c.concedido ? 'Ativo' : 'Revogado'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Cartao>
      </div>
    </div>
  );
}
