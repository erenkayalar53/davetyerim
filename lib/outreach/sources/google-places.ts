import { outreachConfig } from "../config";
import type { RawProspect } from "../types";
import type { DiscoverQuery, DiscoverResult, ProspectSourceAdapter } from "./types";

/**
 * Google Places API (New) — Text Search.
 * Resmi ve kullanım şartlarına uygun kaynak. E-posta DÖNDÜRMEZ;
 * sadece ad/adres/telefon/website verir, e-postayı email-finder çıkarır.
 *
 * Dikkat: Google'ın şartları, döndürülen içeriğin süresiz saklanmasına izin
 * vermez. Biz yalnızca kendi erişimimiz için iletişim bilgisini tutuyoruz;
 * place_id dışında Google içeriğini siteye yayınlamıyoruz.
 */
const ENDPOINT = "https://places.googleapis.com/v1/places:searchText";

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.internationalPhoneNumber",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.businessStatus",
  "nextPageToken",
].join(",");

interface PlacesResponse {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    internationalPhoneNumber?: string;
    nationalPhoneNumber?: string;
    websiteUri?: string;
    rating?: number;
    userRatingCount?: number;
    businessStatus?: string;
  }>;
  nextPageToken?: string;
  error?: { message?: string };
}

export const googlePlacesSource: ProspectSourceAdapter = {
  key: "google_places",
  label: "Google Places",

  isConfigured() {
    return Boolean(outreachConfig.googlePlacesKey);
  },

  async discover({ city, term, limit }: DiscoverQuery): Promise<DiscoverResult> {
    if (!this.isConfigured()) {
      return { prospects: [], error: "GOOGLE_PLACES_API_KEY tanımlı değil" };
    }

    const prospects: RawProspect[] = [];
    let pageToken: string | undefined;

    try {
      while (prospects.length < limit) {
        const body: Record<string, unknown> = {
          textQuery: `${term} ${city}`,
          languageCode: "tr",
          regionCode: "TR",
          pageSize: Math.min(20, limit - prospects.length),
        };
        if (pageToken) body.pageToken = pageToken;

        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": outreachConfig.googlePlacesKey,
            "X-Goog-FieldMask": FIELD_MASK,
          },
          body: JSON.stringify(body),
          cache: "no-store",
        });

        const data = (await res.json()) as PlacesResponse;

        if (!res.ok) {
          return {
            prospects,
            error: data.error?.message ?? `Places API ${res.status}`,
          };
        }

        for (const place of data.places ?? []) {
          const name = place.displayName?.text?.trim();
          if (!name) continue;
          // Kapanmış işletmelere mail atmanın anlamı yok
          if (place.businessStatus && place.businessStatus !== "OPERATIONAL") continue;

          prospects.push({
            source: "google_places",
            source_ref: place.id ?? "",
            name,
            city,
            address: place.formattedAddress ?? "",
            phone: place.internationalPhoneNumber ?? place.nationalPhoneNumber ?? "",
            website: place.websiteUri ?? "",
            rating: place.rating ?? null,
            rating_count: place.userRatingCount ?? null,
          });
        }

        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }

      return { prospects };
    } catch (err) {
      return {
        prospects,
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
