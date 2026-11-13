"use client"

import { useEffect, useState } from "react"
import type { Dictionary } from "@/lib/dictionaries/types"
import type { Locale } from "@/lib/i18n"
import type { Property } from "@/lib/properties"
import Link from "next/link"
import { MapPin } from "lucide-react"

/** Approximate centres for the Istanbul districts we know about. */
const CITY_CENTERS: Record<string, [number, number]> = {
  kadikoy: [40.99, 29.03],
  besiktas: [41.04, 29.0],
  sisli: [41.06, 28.98],
  fatih: [41.01, 28.95],
  beyoglu: [41.03, 28.97],
  basaksehir: [41.1, 28.8],
  kayashehir: [41.12, 28.78],
  esenyurt: [41.03, 28.67],
  beylikduzu: [41.0, 28.65],
  kucukcekmece: [41.0, 28.77],
  buyukcekmece: [41.02, 28.57],
  avcilar: [40.98, 28.72],
  bakirkoy: [40.98, 28.87],
  zeytinburnu: [41.0, 28.9],
  atasehir: [40.99, 29.12],
  umraniye: [41.02, 29.1],
  uskudar: [41.02, 29.02],
  kartal: [40.91, 29.19],
  maltepe: [40.93, 29.13],
  pendik: [40.88, 29.23],
  tuzla: [40.82, 29.3],
  sancaktepe: [41.0, 29.22],
  cekmekoy: [41.04, 29.18],
  sultanbeyli: [40.97, 29.27],
  sultangazi: [41.11, 28.87],
  gaziosmanpasa: [41.06, 28.91],
  bayrampasa: [41.04, 28.9],
  esenler: [41.04, 28.86],
  gungoren: [41.02, 28.87],
  bahcelievler: [41.0, 28.85],
  kagithane: [41.08, 28.96],
  beykoz: [41.14, 29.1],
  sariyer: [41.17, 29.05],
  arnavutkoy: [41.18, 28.74],
  catalca: [41.14, 28.46],
  sile: [41.17, 29.61],
  silivri: [41.07, 28.25],
  adalar: [40.87, 29.09],
}

type Libs = [typeof import("leaflet"), typeof import("react-leaflet")]

let libsPromise: Promise<Libs> | null = null
function loadLibs(): Promise<Libs> {
  if (!libsPromise) {
    libsPromise = Promise.all([import("leaflet"), import("react-leaflet")]) as Promise<Libs>
  }
  return libsPromise
}

export function ListingsMap({
  properties,
  locale,
  dict,
}: {
  properties: Property[]
  locale: Locale
  dict: Dictionary
}) {
  const [libs, setLibs] = useState<Libs | null>(null)

  useEffect(() => {
    let cancelled = false
    loadLibs().then((loaded) => {
      if (!cancelled) setLibs(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!libs) {
    return (
      <div className="grid h-[60vh] place-items-center rounded-2xl bg-sand-100">
        <div className="size-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      </div>
    )
  }

  const [leaflet, reactLeaflet] = libs
  const { MapContainer, TileLayer, Marker, Popup } = reactLeaflet
  const divIcon = leaflet.divIcon({
    className: "iskan-map-pin",
    html: '<span style="display:block;width:14px;height:14px;border-radius:9999px;background:#147057;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3)"></span>',
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })

  const markers = properties
    .map((p) => {
      const pos = p.location
        ? [p.location.lat, p.location.lng]
        : CITY_CENTERS[p.city]
      if (!pos) return null
      return { property: p, pos: pos as [number, number] }
    })
    .filter(Boolean) as { property: Property; pos: [number, number] }[]

  const center: [number, number] =
    markers.length > 0
      ? [
          markers.reduce((s, m) => s + m.pos[0], 0) / markers.length,
          markers.reduce((s, m) => s + m.pos[1], 0) / markers.length,
        ]
      : [41.0082, 28.9784]

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-slate-200/70">
      <MapContainer
        center={center}
        zoom={markers.length > 1 ? 10 : 11}
        scrollWheelZoom={false}
        className="h-[60vh] w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(({ property, pos }) => (
          <Marker key={property.slug} position={pos} icon={divIcon}>
            <Popup>
              <div className="w-56">
                {property.images[0] && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={property.images[0]}
                    alt={property.name[locale]}
                    className="h-28 w-full rounded-lg object-cover"
                  />
                )}
                <p className="mt-2 text-sm font-bold">{property.name[locale]}</p>
                <p className="text-xs text-slate-500">
                  {dict.cities[property.city]}
                </p>
                <p className="mt-1 text-sm font-bold text-brand-700">
                  {property.price.toLocaleString()} {property.currency ?? "TRY"}
                </p>
                <Link
                  href={`/${locale}/properties/${property.slug}`}
                  className="mt-2 inline-block text-xs font-bold text-brand-600 underline"
                >
                  {locale === "ar" ? "عرض التفاصيل" : "View details"}
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
