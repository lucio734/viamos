/**
 * MODEL — conexão com o PostgreSQL.
 * Todas as consultas passam pelo Drizzle ORM (parametrizadas → proteção contra SQL Injection, item #40).
 */
import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../config/env.js';
import * as schema from './schema.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: env.NODE_ENV === 'test' ? 5 : 10,
  // Neon e outros provedores em nuvem exigem TLS; localmente não é necessário.
  ssl: env.DATABASE_URL.includes('sslmode=require') || env.DATABASE_URL.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

export const db = drizzle(pool, { schema });

export type Db = typeof db;
export type Tx = Parameters<Parameters<Db['transaction']>[0]>[0];

export async function fecharConexao(): Promise<void> {
  await pool.end();
}
