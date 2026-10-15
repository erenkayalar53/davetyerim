import { googlePlacesSource } from "./google-places";
import { directorySource } from "./directory";
import type { ProspectSourceAdapter } from "./types";

/**
 * Kaynak kaydı. Yeni bir kaynak eklemek için ProspectSourceAdapter'ı
 * uygulayan bir dosya yazıp buraya eklemek yeterli — pipeline değişmez.
 */
export const SOURCES: ProspectSourceAdapter[] = [
  googlePlacesSource,
  directorySource,
];

export function getSource(key: string): ProspectSourceAdapter | null {
  return SOURCES.find((s) => s.key === key) ?? null;
}

/** Env'i tamamlanmış, gerçekten çalışabilecek kaynaklar. */
export function configuredSources(): ProspectSourceAdapter[] {
  return SOURCES.filter((s) => s.isConfigured());
}

export type { ProspectSourceAdapter } from "./types";
