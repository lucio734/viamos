-- RNF33 / RF44: a trilha de auditoria é imutável.
-- Gatilho que impede UPDATE e DELETE em eventos_auditoria (apenas INSERT é permitido).
CREATE OR REPLACE FUNCTION impedir_alteracao_auditoria() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION 'eventos_auditoria é somente-inserção (trilha de auditoria imutável)';
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_auditoria_imutavel ON "eventos_auditoria";
--> statement-breakpoint
CREATE TRIGGER trg_auditoria_imutavel
  BEFORE UPDATE OR DELETE ON "eventos_auditoria"
  FOR EACH ROW EXECUTE FUNCTION impedir_alteracao_auditoria();
--> statement-breakpoint
-- Mantém atualizado_em coerente nas tabelas principais
CREATE OR REPLACE FUNCTION atualizar_timestamp() RETURNS trigger AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
DROP TRIGGER IF EXISTS trg_usuarios_atualizado_em ON "usuarios";
--> statement-breakpoint
CREATE TRIGGER trg_usuarios_atualizado_em BEFORE UPDATE ON "usuarios" FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();
