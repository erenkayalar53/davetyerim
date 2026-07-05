"use client";

import Image from "next/image";
import { useState } from "react";
import type { VenuePhoto } from "@/lib/types";

export function Gallery({
  photos,
  venueName,
}: {
  photos: VenuePhoto[];
  venueName: string;
}) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/10] items-center justify-center rounded-[1.75rem] border border-hairline bg-cream-deep text-sm text-mute">
        Fotoğraf yakında eklenecek
      </div>
    );
  }

  return (
    <div className="rounded-[1.75rem] border border-hairline bg-parchment p-1.5 shadow-float">
      <div className="relative aspect-[16/10] overflow-hidden rounded-[calc(1.75rem-0.375rem)]">
        <Image
          key={photos[active].id}
          src={photos[active].url}
          alt={`${venueName} — fotoğraf ${active + 1}`}
          fill
          priority={active === 0}
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />
        {photos.length > 1 && (
          <span className="absolute bottom-3 right-3 rounded-full bg-ink/60 px-3 py-1 text-xs text-cream backdrop-blur-sm">
            {active + 1} / {photos.length}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="scroll-thin flex gap-2 overflow-x-auto p-2">
          {photos.map((photo, i) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Fotoğraf ${i + 1}`}
              className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl transition-all duration-500 ease-lux ${
                i === active
                  ? "ring-2 ring-bordeaux"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={photo.url}
                alt=""
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
