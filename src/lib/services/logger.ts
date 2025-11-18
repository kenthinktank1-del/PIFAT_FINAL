import { supabase } from '../supabase';
import { createChainedHash } from '../utils/hash';

interface LogEntry {
  case_id?: string;
  action: string;
  details?: Record<string, unknown>;
  ip_address?: string;
}

export async function createLog(entry: LogEntry): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user for logging');
      return;
    }

    const { data: lastLog } = await supabase
      .from('logs')
      .select('hash_current')
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    const logData = {
      case_id: entry.case_id,
      user_id: user.id,
      action: entry.action,
      details: entry.details || {},
      timestamp: new Date().toISOString(),
      ip_address: entry.ip_address,
    };

    const hashCurrent = await createChainedHash(
      lastLog?.hash_current || null,
      logData
    );

    await supabase.from('logs').insert({
      ...logData,
      hash_prev: lastLog?.hash_current || null,
      hash_current: hashCurrent,
    });
  } catch (error) {
    console.error('Failed to create log:', error);
  }
}

export async function createChainOfCustodyEntry(
  evidenceId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      console.error('No authenticated user for CoC entry');
      return;
    }

    const { data: lastCoCEntry } = await supabase
      .from('chain_of_custody')
      .select('hash_current')
      .eq('evidence_id', evidenceId)
      .order('timestamp', { ascending: false })
      .limit(1)
      .maybeSingle();

    const cocData = {
      evidence_id: evidenceId,
      action,
      performed_by: user.id,
      timestamp: new Date().toISOString(),
      details: details || {},
    };

    const hashCurrent = await createChainedHash(
      lastCoCEntry?.hash_current || null,
      cocData
    );

    await supabase.from('chain_of_custody').insert({
      ...cocData,
      hash_prev: lastCoCEntry?.hash_current || null,
      hash_current: hashCurrent,
    });
  } catch (error) {
    console.error('Failed to create CoC entry:', error);
  }
}
