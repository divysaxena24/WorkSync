import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined');
}

const rawSql = neon(process.env.DATABASE_URL);

/**
 * Robust SQL wrapper with retry logic for serverless environments.
 * Handles transient "fetch failed" and connection errors with exponential backoff.
 */
export async function sql(strings: TemplateStringsArray, ...values: any[]): Promise<any> {
  const MAX_RETRIES = 5;
  const INITIAL_DELAY = 800;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      return await rawSql(strings, ...values);
    } catch (error: any) {
      attempt++;
      
      const errorMessage = error?.message || "";
      const errorName = error?.name || "";
      const errorCode = error?.code || "";

      const isTransient = 
        errorMessage.includes('fetch failed') || 
        errorMessage.includes('ConnectTimeoutError') ||
        errorMessage.includes('UND_ERR_CONNECT_TIMEOUT') ||
        errorName === 'TypeError' ||
        errorCode === 'ECONNRESET' ||
        errorCode === 'ETIMEDOUT';
      
      if (isTransient && attempt < MAX_RETRIES) {
        const delay = Math.pow(2, attempt - 1) * INITIAL_DELAY; // 800ms, 1.6s, 3.2s...
        console.warn(`[Neon SQL] Transient failed (attempt ${attempt}/${MAX_RETRIES}). Retrying in ${delay}ms...`, errorMessage);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      console.error(`[Neon SQL] Critical error after ${attempt} attempts:`, errorMessage);
      throw error;
    }
  }
}
