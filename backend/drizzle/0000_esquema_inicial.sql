CREATE TYPE "public"."finalidade_consentimento" AS ENUM('TERMOS_USO', 'PRIVACIDADE', 'LOCALIZACAO', 'NOTIFICACOES');--> statement-breakpoint
CREATE TYPE "public"."papel_usuario" AS ENUM('CLIENTE', 'INTERPRETE', 'BACKOFFICE', 'SUPORTE');--> statement-breakpoint
CREATE TYPE "public"."resultado_analise" AS ENUM('APROVADO', 'REPROVADO', 'CORRECAO');--> statement-breakpoint
CREATE TYPE "public"."status_atendimento" AS ENUM('AGENDADO', 'EM_ANDAMENTO', 'CONCLUIDO', 'CANCELADO');--> statement-breakpoint
CREATE TYPE "public"."status_certificacao" AS ENUM('EM_ANALISE', 'APROVADA', 'REPROVADA', 'CORRECAO_SOLICITADA');--> statement-breakpoint
CREATE TYPE "public"."status_chamado" AS ENUM('ABERTO', 'EM_ATENDIMENTO', 'ENCERRADO');--> statement-breakpoint
CREATE TYPE "public"."status_habilitacao" AS ENUM('PENDENTE', 'EM_ANALISE', 'APROVADO', 'REPROVADO', 'CORRECAO_SOLICITADA');--> statement-breakpoint
CREATE TYPE "public"."status_oferta" AS ENUM('ENVIADA', 'ACEITA', 'RECUSADA', 'EXPIRADA');--> statement-breakpoint
CREATE TYPE "public"."status_pagamento" AS ENUM('PENDENTE', 'PAGO', 'FALHOU', 'ESTORNADO');--> statement-breakpoint
CREATE TYPE "public"."status_repasse" AS ENUM('SOLICITADO', 'PROCESSANDO', 'PAGO', 'FALHOU');--> statement-breakpoint
CREATE TYPE "public"."status_solicitacao_dados" AS ENUM('ABERTA', 'CONCLUIDA', 'NEGADA');--> statement-breakpoint
CREATE TYPE "public"."status_solicitacao" AS ENUM('BUSCANDO', 'ACEITA', 'EM_ANDAMENTO', 'CONCLUIDA', 'CANCELADA');--> statement-breakpoint
CREATE TYPE "public"."tipo_certificacao" AS ENUM('PROLIBRAS', 'EQUIVALENTE');--> statement-breakpoint
CREATE TYPE "public"."tipo_chamado" AS ENUM('SUPORTE', 'EMERGENCIA');--> statement-breakpoint
CREATE TYPE "public"."tipo_forma_pagamento" AS ENUM('PIX', 'CARTAO');--> statement-breakpoint
CREATE TYPE "public"."tipo_lancamento" AS ENUM('CREDITO_ATENDIMENTO', 'DEBITO_REPASSE', 'ESTORNO');--> statement-breakpoint
CREATE TYPE "public"."tipo_mensagem" AS ENUM('TEXTO', 'IMAGEM', 'LOCALIZACAO', 'SISTEMA');--> statement-breakpoint
CREATE TYPE "public"."tipo_notificacao" AS ENUM('ACEITE', 'LEMBRETE', 'MENSAGEM', 'PAGAMENTO', 'CERTIFICACAO', 'SOLICITACAO', 'SISTEMA');--> statement-breakpoint
CREATE TYPE "public"."tipo_servico" AS ENUM('SAUDE', 'JURIDICO', 'EDUCACAO', 'EVENTO', 'OUTRO');--> statement-breakpoint
CREATE TYPE "public"."tipo_solicitacao_dados" AS ENUM('EXPORTACAO', 'EXCLUSAO');--> statement-breakpoint
CREATE TABLE "analises_documentais" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"certificacao_id" uuid NOT NULL,
	"operador_id" uuid NOT NULL,
	"resultado" "resultado_analise" NOT NULL,
	"justificativa" text,
	"data" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "atendimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solicitacao_id" uuid NOT NULL,
	"interprete_id" uuid NOT NULL,
	"aceito_em" timestamp with time zone DEFAULT now() NOT NULL,
	"inicio_real" timestamp with time zone,
	"fim_real" timestamp with time zone,
	"duracao_real_min" integer,
	"valor_final" numeric(10, 2),
	"status" "status_atendimento" DEFAULT 'AGENDADO' NOT NULL,
	CONSTRAINT "atendimentos_solicitacao_id_unique" UNIQUE("solicitacao_id")
);
--> statement-breakpoint
CREATE TABLE "avaliacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid NOT NULL,
	"autor_id" uuid NOT NULL,
	"avaliado_id" uuid NOT NULL,
	"nota" smallint NOT NULL,
	"comentario" varchar(500),
	"data" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "avaliacoes_nota_check" CHECK ("avaliacoes"."nota" BETWEEN 1 AND 5),
	CONSTRAINT "avaliacoes_autor_diferente_check" CHECK ("avaliacoes"."autor_id" <> "avaliacoes"."avaliado_id")
);
--> statement-breakpoint
CREATE TABLE "certificacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interprete_id" uuid NOT NULL,
	"tipo" "tipo_certificacao" NOT NULL,
	"numero" varchar(60) NOT NULL,
	"nome_arquivo" varchar(200) NOT NULL,
	"mime_arquivo" varchar(80) NOT NULL,
	"arquivo" "bytea" NOT NULL,
	"tamanho_bytes" integer NOT NULL,
	"status" "status_certificacao" DEFAULT 'EM_ANALISE' NOT NULL,
	"enviada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "chamados_suporte" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid,
	"solicitante_id" uuid NOT NULL,
	"operador_id" uuid,
	"tipo" "tipo_chamado" NOT NULL,
	"descricao" varchar(500),
	"latitude" double precision,
	"longitude" double precision,
	"status" "status_chamado" DEFAULT 'ABERTO' NOT NULL,
	"aberto_em" timestamp with time zone DEFAULT now() NOT NULL,
	"encerrado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid NOT NULL,
	"qr_hash" varchar(64) NOT NULL,
	"emitido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"lido_em" timestamp with time zone,
	"latitude" double precision,
	"longitude" double precision,
	"precisao_m" double precision,
	"distancia_m" double precision,
	CONSTRAINT "checkins_atendimento_id_unique" UNIQUE("atendimento_id"),
	CONSTRAINT "checkins_qr_hash_unique" UNIQUE("qr_hash")
);
--> statement-breakpoint
CREATE TABLE "clientes" (
	"usuario_id" uuid PRIMARY KEY NOT NULL,
	"cpf" varchar(11) NOT NULL,
	"data_nascimento" date NOT NULL,
	"cep" varchar(8),
	"endereco" text,
	"preferencias_acessibilidade" text,
	CONSTRAINT "clientes_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
CREATE TABLE "comprovantes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid NOT NULL,
	"codigo_verificacao" uuid DEFAULT gen_random_uuid() NOT NULL,
	"data_atendimento" timestamp with time zone NOT NULL,
	"url_pdf" text NOT NULL,
	"emitido_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "comprovantes_atendimento_id_unique" UNIQUE("atendimento_id"),
	CONSTRAINT "comprovantes_codigo_verificacao_unique" UNIQUE("codigo_verificacao")
);
--> statement-breakpoint
CREATE TABLE "consentimentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"finalidade" "finalidade_consentimento" NOT NULL,
	"versao_termo" varchar(20) NOT NULL,
	"concedido_em" timestamp with time zone DEFAULT now() NOT NULL,
	"revogado_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "contas_bancarias" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interprete_id" uuid NOT NULL,
	"banco" varchar(60) NOT NULL,
	"agencia" varchar(10) NOT NULL,
	"conta" varchar(20) NOT NULL,
	"titular" varchar(120) NOT NULL,
	"chave_pix" varchar(120),
	"principal" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cotacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solicitacao_id" uuid NOT NULL,
	"valor_servico" numeric(10, 2) NOT NULL,
	"valor_deslocamento" numeric(10, 2) NOT NULL,
	"taxa_plataforma" numeric(10, 2) NOT NULL,
	"valor_total" numeric(10, 2) NOT NULL,
	"versao_regra" varchar(20) NOT NULL,
	"calculada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cotacoes_solicitacao_id_unique" UNIQUE("solicitacao_id")
);
--> statement-breakpoint
CREATE TABLE "disponibilidades" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interprete_id" uuid NOT NULL,
	"dia_semana" smallint NOT NULL,
	"inicio" time NOT NULL,
	"fim" time NOT NULL,
	CONSTRAINT "disponibilidades_dia_semana_check" CHECK ("disponibilidades"."dia_semana" BETWEEN 0 AND 6)
);
--> statement-breakpoint
CREATE TABLE "eventos_auditoria" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid,
	"tipo" varchar(60) NOT NULL,
	"entidade" varchar(60),
	"entidade_id" uuid,
	"detalhes" jsonb,
	"ip" varchar(45),
	"data" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "formas_pagamento" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"tipo" "tipo_forma_pagamento" NOT NULL,
	"chave_pix" varchar(120),
	"token_gateway" varchar(120),
	"bandeira" varchar(30),
	"final_cartao" varchar(4),
	"principal" boolean DEFAULT false NOT NULL,
	"ativa" boolean DEFAULT true NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "interpretes" (
	"usuario_id" uuid PRIMARY KEY NOT NULL,
	"documento" varchar(14) NOT NULL,
	"endereco_base" text NOT NULL,
	"latitude_base" double precision NOT NULL,
	"longitude_base" double precision NOT NULL,
	"especialidades" text[] DEFAULT '{}'::text[] NOT NULL,
	"preco_hora" numeric(10, 2) NOT NULL,
	"raio_km" integer DEFAULT 15 NOT NULL,
	"disponivel_agora" boolean DEFAULT false NOT NULL,
	"status_habilitacao" "status_habilitacao" DEFAULT 'PENDENTE' NOT NULL,
	"reputacao" numeric(3, 2),
	"total_avaliacoes" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "interpretes_documento_unique" UNIQUE("documento"),
	CONSTRAINT "interpretes_raio_km_check" CHECK ("interpretes"."raio_km" BETWEEN 1 AND 15)
);
--> statement-breakpoint
CREATE TABLE "lancamentos_financeiros" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interprete_id" uuid NOT NULL,
	"pagamento_id" uuid,
	"repasse_id" uuid,
	"tipo" "tipo_lancamento" NOT NULL,
	"valor" numeric(10, 2) NOT NULL,
	"descricao" varchar(200),
	"data" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "lancamentos_origem_check" CHECK (("lancamentos_financeiros"."pagamento_id" IS NOT NULL AND "lancamentos_financeiros"."repasse_id" IS NULL) OR ("lancamentos_financeiros"."pagamento_id" IS NULL AND "lancamentos_financeiros"."repasse_id" IS NOT NULL))
);
--> statement-breakpoint
CREATE TABLE "localizacoes_compartilhadas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid NOT NULL,
	"usuario_id" uuid NOT NULL,
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"precisao_m" double precision,
	"registrada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"encerrada_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "mensagens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid NOT NULL,
	"autor_id" uuid,
	"tipo" "tipo_mensagem" DEFAULT 'TEXTO' NOT NULL,
	"texto" varchar(1000),
	"arquivo_uri" text,
	"latitude" double precision,
	"longitude" double precision,
	"enviada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"lida_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "notificacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"tipo" "tipo_notificacao" NOT NULL,
	"titulo" varchar(120) NOT NULL,
	"conteudo" varchar(500) NOT NULL,
	"referencia_recurso" varchar(200),
	"lida" boolean DEFAULT false NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ofertas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"solicitacao_id" uuid NOT NULL,
	"interprete_id" uuid NOT NULL,
	"distancia_km" numeric(6, 2) NOT NULL,
	"status" "status_oferta" DEFAULT 'ENVIADA' NOT NULL,
	"enviada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"respondida_em" timestamp with time zone,
	"motivo_recusa" varchar(300)
);
--> statement-breakpoint
CREATE TABLE "pagamentos" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"atendimento_id" uuid NOT NULL,
	"forma_pagamento_id" uuid,
	"valor" numeric(10, 2) NOT NULL,
	"meio" "tipo_forma_pagamento",
	"status" "status_pagamento" DEFAULT 'PENDENTE' NOT NULL,
	"referencia_gateway" varchar(80),
	"mensagem_gateway" varchar(200),
	"tentativas" integer DEFAULT 0 NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"confirmado_em" timestamp with time zone,
	CONSTRAINT "pagamentos_referencia_gateway_unique" UNIQUE("referencia_gateway")
);
--> statement-breakpoint
CREATE TABLE "repasses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"interprete_id" uuid NOT NULL,
	"conta_bancaria_id" uuid,
	"valor" numeric(10, 2) NOT NULL,
	"status" "status_repasse" DEFAULT 'SOLICITADO' NOT NULL,
	"referencia_gateway" varchar(80),
	"solicitado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluido_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "sessoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"token_hash" varchar(64) NOT NULL,
	"dispositivo" varchar(200),
	"expira_em" timestamp with time zone NOT NULL,
	"revogada" boolean DEFAULT false NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessoes_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "solicitacoes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cliente_id" uuid NOT NULL,
	"tipo_servico" "tipo_servico" NOT NULL,
	"inicio_previsto" timestamp with time zone NOT NULL,
	"duracao_prevista_min" integer NOT NULL,
	"endereco" text NOT NULL,
	"complemento" varchar(120),
	"ponto_referencia" varchar(200),
	"latitude" double precision NOT NULL,
	"longitude" double precision NOT NULL,
	"observacoes" varchar(300),
	"status" "status_solicitacao" DEFAULT 'BUSCANDO' NOT NULL,
	"cancelada_em" timestamp with time zone,
	"motivo_cancelamento" varchar(300),
	"taxa_cancelamento" numeric(10, 2),
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizada_em" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "solicitacoes_duracao_min_check" CHECK ("solicitacoes"."duracao_prevista_min" >= 60)
);
--> statement-breakpoint
CREATE TABLE "solicitacoes_dados" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"tipo" "tipo_solicitacao_dados" NOT NULL,
	"status" "status_solicitacao_dados" DEFAULT 'ABERTA' NOT NULL,
	"criada_em" timestamp with time zone DEFAULT now() NOT NULL,
	"concluida_em" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "tokens_recuperacao" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"usuario_id" uuid NOT NULL,
	"hash" varchar(64) NOT NULL,
	"expira_em" timestamp with time zone NOT NULL,
	"usado_em" timestamp with time zone,
	CONSTRAINT "tokens_recuperacao_hash_unique" UNIQUE("hash")
);
--> statement-breakpoint
CREATE TABLE "usuarios" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nome" varchar(120) NOT NULL,
	"email" varchar(160) NOT NULL,
	"senha_hash" varchar(100) NOT NULL,
	"telefone" varchar(20) NOT NULL,
	"papel" "papel_usuario" NOT NULL,
	"foto_url" text,
	"ativo" boolean DEFAULT true NOT NULL,
	"tentativas_falhas" integer DEFAULT 0 NOT NULL,
	"bloqueado_ate" timestamp with time zone,
	"dois_fatores_ativo" boolean DEFAULT false NOT NULL,
	"criado_em" timestamp with time zone DEFAULT now() NOT NULL,
	"atualizado_em" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "analises_documentais" ADD CONSTRAINT "analises_documentais_certificacao_id_certificacoes_id_fk" FOREIGN KEY ("certificacao_id") REFERENCES "public"."certificacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analises_documentais" ADD CONSTRAINT "analises_documentais_operador_id_usuarios_id_fk" FOREIGN KEY ("operador_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_solicitacao_id_solicitacoes_id_fk" FOREIGN KEY ("solicitacao_id") REFERENCES "public"."solicitacoes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "atendimentos" ADD CONSTRAINT "atendimentos_interprete_id_interpretes_usuario_id_fk" FOREIGN KEY ("interprete_id") REFERENCES "public"."interpretes"("usuario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "avaliacoes" ADD CONSTRAINT "avaliacoes_avaliado_id_usuarios_id_fk" FOREIGN KEY ("avaliado_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "certificacoes" ADD CONSTRAINT "certificacoes_interprete_id_interpretes_usuario_id_fk" FOREIGN KEY ("interprete_id") REFERENCES "public"."interpretes"("usuario_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chamados_suporte" ADD CONSTRAINT "chamados_suporte_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chamados_suporte" ADD CONSTRAINT "chamados_suporte_solicitante_id_usuarios_id_fk" FOREIGN KEY ("solicitante_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chamados_suporte" ADD CONSTRAINT "chamados_suporte_operador_id_usuarios_id_fk" FOREIGN KEY ("operador_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkins" ADD CONSTRAINT "checkins_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "clientes" ADD CONSTRAINT "clientes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "comprovantes" ADD CONSTRAINT "comprovantes_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consentimentos" ADD CONSTRAINT "consentimentos_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contas_bancarias" ADD CONSTRAINT "contas_bancarias_interprete_id_interpretes_usuario_id_fk" FOREIGN KEY ("interprete_id") REFERENCES "public"."interpretes"("usuario_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cotacoes" ADD CONSTRAINT "cotacoes_solicitacao_id_solicitacoes_id_fk" FOREIGN KEY ("solicitacao_id") REFERENCES "public"."solicitacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "disponibilidades" ADD CONSTRAINT "disponibilidades_interprete_id_interpretes_usuario_id_fk" FOREIGN KEY ("interprete_id") REFERENCES "public"."interpretes"("usuario_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "eventos_auditoria" ADD CONSTRAINT "eventos_auditoria_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "formas_pagamento" ADD CONSTRAINT "formas_pagamento_cliente_id_clientes_usuario_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("usuario_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "interpretes" ADD CONSTRAINT "interpretes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_interprete_id_interpretes_usuario_id_fk" FOREIGN KEY ("interprete_id") REFERENCES "public"."interpretes"("usuario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_pagamento_id_pagamentos_id_fk" FOREIGN KEY ("pagamento_id") REFERENCES "public"."pagamentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lancamentos_financeiros" ADD CONSTRAINT "lancamentos_financeiros_repasse_id_repasses_id_fk" FOREIGN KEY ("repasse_id") REFERENCES "public"."repasses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "localizacoes_compartilhadas" ADD CONSTRAINT "localizacoes_compartilhadas_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "localizacoes_compartilhadas" ADD CONSTRAINT "localizacoes_compartilhadas_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mensagens" ADD CONSTRAINT "mensagens_autor_id_usuarios_id_fk" FOREIGN KEY ("autor_id") REFERENCES "public"."usuarios"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notificacoes" ADD CONSTRAINT "notificacoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_solicitacao_id_solicitacoes_id_fk" FOREIGN KEY ("solicitacao_id") REFERENCES "public"."solicitacoes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ofertas" ADD CONSTRAINT "ofertas_interprete_id_interpretes_usuario_id_fk" FOREIGN KEY ("interprete_id") REFERENCES "public"."interpretes"("usuario_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_atendimento_id_atendimentos_id_fk" FOREIGN KEY ("atendimento_id") REFERENCES "public"."atendimentos"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pagamentos" ADD CONSTRAINT "pagamentos_forma_pagamento_id_formas_pagamento_id_fk" FOREIGN KEY ("forma_pagamento_id") REFERENCES "public"."formas_pagamento"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repasses" ADD CONSTRAINT "repasses_interprete_id_interpretes_usuario_id_fk" FOREIGN KEY ("interprete_id") REFERENCES "public"."interpretes"("usuario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repasses" ADD CONSTRAINT "repasses_conta_bancaria_id_contas_bancarias_id_fk" FOREIGN KEY ("conta_bancaria_id") REFERENCES "public"."contas_bancarias"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessoes" ADD CONSTRAINT "sessoes_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacoes" ADD CONSTRAINT "solicitacoes_cliente_id_clientes_usuario_id_fk" FOREIGN KEY ("cliente_id") REFERENCES "public"."clientes"("usuario_id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "solicitacoes_dados" ADD CONSTRAINT "solicitacoes_dados_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tokens_recuperacao" ADD CONSTRAINT "tokens_recuperacao_usuario_id_usuarios_id_fk" FOREIGN KEY ("usuario_id") REFERENCES "public"."usuarios"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "atendimentos_interprete_idx" ON "atendimentos" USING btree ("interprete_id");--> statement-breakpoint
CREATE UNIQUE INDEX "avaliacoes_autor_por_atendimento_unique" ON "avaliacoes" USING btree ("atendimento_id","autor_id");--> statement-breakpoint
CREATE INDEX "eventos_auditoria_data_idx" ON "eventos_auditoria" USING btree ("data");--> statement-breakpoint
CREATE INDEX "lancamentos_interprete_idx" ON "lancamentos_financeiros" USING btree ("interprete_id","data");--> statement-breakpoint
CREATE INDEX "mensagens_atendimento_idx" ON "mensagens" USING btree ("atendimento_id","enviada_em");--> statement-breakpoint
CREATE INDEX "notificacoes_usuario_idx" ON "notificacoes" USING btree ("usuario_id","lida");--> statement-breakpoint
CREATE UNIQUE INDEX "ofertas_solicitacao_interprete_unique" ON "ofertas" USING btree ("solicitacao_id","interprete_id");--> statement-breakpoint
CREATE UNIQUE INDEX "pagamentos_um_pago_por_atendimento" ON "pagamentos" USING btree ("atendimento_id") WHERE "pagamentos"."status" = 'PAGO';--> statement-breakpoint
CREATE INDEX "solicitacoes_status_idx" ON "solicitacoes" USING btree ("status");--> statement-breakpoint
CREATE INDEX "solicitacoes_cliente_idx" ON "solicitacoes" USING btree ("cliente_id");--> statement-breakpoint
CREATE UNIQUE INDEX "usuarios_email_unique" ON "usuarios" USING btree (lower("email"));