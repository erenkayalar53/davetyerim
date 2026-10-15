import type { RawProspect } from "../types";

export interface DiscoverQuery {
  city: string;
  term: string;
  /** Kaynağın döndürmesi beklenen en fazla kayıt. */
  limit: number;
}

export interface DiscoverResult {
  prospects: RawProspect[];
  /** Kaynak çalışamadıysa sebebi — cron bunu loglar, çökmez. */
  error?: string;
}

export interface ProspectSourceAdapter {
  key: string;
  label: string;
  /** Gerekli env yoksa false döner; cron o kaynağı atlar. */
  isConfigured(): boolean;
  discover(query: DiscoverQuery): Promise<DiscoverResult>;
}
