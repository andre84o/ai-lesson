# Motorcycle Repair Search Engine

En enkel sökmotor för att hitta verkstäder som kan reparera motorcyklar i utvalda europeiska städer.

## Funktionalitet

- Laddar en lista med länder och städer från `data/cities.csv`
- Geokodar städer via OpenStreetMap Nominatim
- Hämtar POIs från Overpass API med flexibla tagg-/nyckelordsfilter
- Modern webbgränssnitt byggt med Next.js och React

**OBS:** Denna implementation gör nätverksanrop mot offentliga OSM-tjänster (Nominatim och Overpass). Respektera användarvillkor och rate limits.

## Installation

1. Installera beroenden:

```bash
npm install
```

## Kör applikationen

### Development mode

```bash
npm run dev
```

Öppna [http://localhost:3000](http://localhost:3000) i din webbläsare.

### Production build

```bash
npm run build
npm start
```

## Teknologi

- **Next.js 14** - React framework med App Router
- **TypeScript** - Typsäker JavaScript
- **OpenStreetMap Nominatim** - Geokodning
- **Overpass API** - POI-sökning

## Projektstruktur

```
├── app/
│   ├── api/
│   │   ├── cities/      # API endpoint för städer
│   │   └── search/      # API endpoint för sökning
│   ├── globals.css      # Globala stilar
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Huvudsida
├── lib/
│   └── search-engine.ts # Sökmotor logik
├── data/
│   └── cities.csv       # Lista över städer
└── public/              # Statiska filer
```
