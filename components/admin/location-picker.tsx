"use client"

import { useEffect, useState } from "react"
import { Crosshair, Loader2, MapPin } from "lucide-react"

/**
 * Map picker for the admin property form.
 *
 * Leaflet is loaded lazily (it touches `window`) and rendered only after mount,
 * which keeps it working with the app router on Workers. Tiles come from
 * OpenStreetMap, so no API key is required.
 *
 * Clicking the map (or using the locate button) writes the point into form
 * fields that the server action reads back — the listing stays optional.
 */

const ISTANBUL: [number, number] = [41.0082, 28.9784]

type LeafletModule = typeof import("leaflet")
type ReactLeaflet = typeof import("react-leaflet")

let libsPromise: Promise<[LeafletModule, ReactLeaflet]> | null = null

function loadLeaflet() {
  libsPromise ??= Promise.all([
    import("leaflet"),
    import("react-leaflet"),
  ]) as Promise<[LeafletModule, ReactLeaflet]>
  return libsPromise
}

function PickerMap({
  lat,
  lng,
  enabled,
  onPick,
}: {
  lat: number
  lng: number
  enabled: boolean
  onPick: (lat: number, lng: number) => void
}) {
  const [libs, setLibs] = useState<[LeafletModule, ReactLeaflet] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then((loaded) => {
      if (!cancelled) setLibs(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!libs) {
    return (
      <div className="grid h-72 place-items-center bg-sand-100">
        <Loader2 className="size-5 animate-spin text-brand-600" />
      </div>
    )
  }

  const [leaflet, reactLeaflet] = libs
  const { MapContainer, TileLayer, CircleMarker, useMapEvents } = reactLeaflet

  function ClickCatcher() {
    useMapEvents({
      click(event) {
        onPick(event.latlng.lat, event.latlng.lng)
      },
    })
    return null
  }

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={enabled ? 16 : 11}
      scrollWheelZoom={false}
      className="h-72 w-full"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCatcher />
      {enabled && (
        <CircleMarker
          center={[lat, lng]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: "#147057",
            fillOpacity: 1,
          }}
        />
      )}
    </MapContainer>
  )
}

export function LocationPicker({
  defaultLat,
  defaultLng,
  defaultLabel,
  label,
  hint,
  pickOnMap,
  useMyLocation,
  clear,
  latPlaceholder,
  lngPlaceholder,
  labelPlaceholder,
}: {
  defaultLat?: number
  defaultLng?: number
  defaultLabel?: string
  label: string
  hint?: string
  pickOnMap: string
  useMyLocation: string
  clear: string
  latPlaceholder: string
  lngPlaceholder: string
  labelPlaceholder: string
}) {
  const hasInitial =
    typeof defaultLat === "number" && typeof defaultLng === "number"
  const [enabled, setEnabled] = useState(hasInitial)
  const [lat, setLat] = useState(defaultLat ?? ISTANBUL[0])
  const [lng, setLng] = useState(defaultLng ?? ISTANBUL[1])

  const pick = (nextLat: number, nextLng: number) => {
    setLat(nextLat)
    setLng(nextLng)
    setEnabled(true)
  }

  const handleMyLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((position) => {
      pick(position.coords.latitude, position.coords.longitude)
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2.5">
        <label className="flex cursor-pointer items-center gap-2.5 rounded-xl bg-sand-100 px-3.5 py-2.5 text-sm font-bold text-ink-900 ring-1 ring-slate-200">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => {
              if (event.target.checked) setEnabled(true)
              else setEnabled(false)
            }}
            className="size-4 accent-brand-600"
          />
          {label}
        </label>

        <button
          type="button"
          onClick={handleMyLocation}
          className="inline-flex items-center gap-2 rounded-xl bg-sand-100 px-3.5 py-2.5 text-sm font-bold text-ink-900 ring-1 ring-slate-200 transition hover:ring-brand-400"
        >
          <Crosshair className="size-4 text-brand-600" />
          {useMyLocation}
        </button>

        <input type="hidden" name="locationEnabled" value={enabled ? "1" : ""} />
        <input type="hidden" name="locationLat" value={enabled ? lat : ""} />
        <input type="hidden" name="locationLng" value={enabled ? lng : ""} />
      </div>

      {enabled && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              type="number"
              step="any"
              dir="ltr"
              value={lat}
              onChange={(event) => pick(Number(event.target.value) || 0, lng)}
              placeholder={latPlaceholder}
              className="w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
            />
            <input
              type="number"
              step="any"
              dir="ltr"
              value={lng}
              onChange={(event) => pick(lat, Number(event.target.value) || 0)}
              placeholder={lngPlaceholder}
              className="w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div>
            <input
              name="locationLabel"
              defaultValue={defaultLabel ?? ""}
              placeholder={labelPlaceholder}
              className="w-full rounded-xl border-0 bg-sand-100 px-3.5 py-2.5 text-sm font-semibold text-ink-900 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-brand-600"
            />
          </div>

          <div className="relative overflow-hidden rounded-2xl ring-1 ring-slate-200">
            <PickerMap lat={lat} lng={lng} enabled={enabled} onPick={pick} />
            <span className="pointer-events-none absolute bottom-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-ink-950/80 px-3 py-1.5 text-[11px] font-bold text-white backdrop-blur">
              <MapPin className="size-3.5" />
              {pickOnMap}
            </span>
          </div>
        </div>
      )}

      {hint && <p className="text-xs font-semibold text-slate-400">{hint}</p>}
    </div>
  )
}

/** Read-only map shown on the public property page. */
export function PropertyMap({
  lat,
  lng,
  label,
  className = "",
}: {
  lat: number
  lng: number
  label?: string
  className?: string
}) {
  const [libs, setLibs] = useState<[LeafletModule, ReactLeaflet] | null>(null)

  useEffect(() => {
    let cancelled = false
    loadLeaflet().then((loaded) => {
      if (!cancelled) setLibs(loaded)
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (!libs) {
    return (
      <div
        className={`h-64 rounded-2xl bg-sand-100 ring-1 ring-slate-200 ${className}`}
      />
    )
  }

  const [leaflet, reactLeaflet] = libs
  const { MapContainer, TileLayer, CircleMarker, ZoomControl } = reactLeaflet
  void leaflet

  return (
    <div className={`overflow-hidden rounded-2xl ring-1 ring-slate-200 ${className}`}>
      <MapContainer
        center={[lat, lng]}
        zoom={16}
        scrollWheelZoom={false}
        zoomControl={false}
        className="h-64 w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CircleMarker
          center={[lat, lng]}
          radius={10}
          pathOptions={{
            color: "#ffffff",
            weight: 3,
            fillColor: "#147057",
            fillOpacity: 1,
          }}
        />
        <ZoomControl position="bottomleft" />
      </MapContainer>
      {label && (
        <p className="border-t border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-ink-700">
          {label}
        </p>
      )}
      <div className="flex items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-2.5">
        <p className="text-xs font-semibold text-slate-400" dir="ltr">
          {lat.toFixed(5)}, {lng.toFixed(5)}
        </p>
        <a
          href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[13px] font-bold text-brand-700 underline underline-offset-2 transition hover:text-brand-800"
        >
          Google Maps
        </a>
      </div>
    </div>
  )
}
