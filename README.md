# Switzerland Trip Planner

Interactive no-car Switzerland itinerary planner for July 9-14, starting in Zurich and ending in Zurich.

This repository now includes two versions:

- A web planner built with React, TypeScript, Vite, Leaflet, and OpenStreetMap.
- A native iPhone planner built with SwiftUI, MapKit, and SwiftData.

The planners include:

- Day-by-day itinerary cards
- Interactive route maps
- Clickable commute legs and route stops
- Place explanations in plain language
- Weather decision guidance
- Schilthorn vs Jungfraujoch route toggle
- Optional Harder Kulm toggle
- Budget estimate cards
- Rail-pass comparison helper
- Booking status tracker
- Luggage notes
- Print/export view

## Quick Start

You need Node.js installed. Node 20 or newer is recommended.

```bash
npm install
npm run dev
```

Then open:

```text
http://127.0.0.1:5173/
```

If Vite chooses a different port, the terminal will print the correct local URL.

## Build

To check that the app builds for production:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Project Structure

```text
src/App.tsx       Main React app and interactions
src/tripData.ts  Itinerary, places, commute legs, prices, and source links
src/styles.css   Layout and visual styling
```

Most itinerary edits should happen in `src/tripData.ts`.

## Notes

- The map uses OpenStreetMap tiles through Leaflet, so an internet connection is needed for map tiles.
- Price ranges are planning estimates, not final quotes. Verify exact 2026 fares, pass validity, and mountain lift operations before booking.
- The route is designed around public transport only, with no rental car.

## Native iPhone App

The SwiftUI app lives in:

```text
ios/SwitzerlandTripPlanner/
```

To run it:

1. Install full Xcode.
2. Open `ios/SwitzerlandTripPlanner/SwitzerlandTripPlanner.xcodeproj`.
3. Choose an iPhone simulator.
4. Press Run.

The native app mirrors the main planner capabilities with iPhone-first navigation: Trip, Map, Decisions, and Bookings tabs; MapKit route pins and polylines; haptics; native share sheet; and SwiftData persistence for checklist, pass, weather, and route choices.

See `ios/SwitzerlandTripPlanner/README.md` for iOS-specific notes.

## Sharing

When sending the web app to someone else, include:

- `package.json`
- `package-lock.json`
- `index.html`
- `vite.config.ts`
- `tsconfig.json`
- `tsconfig.app.json`
- `src/`
- `README.md`

Do not include `node_modules/` or `dist/`; they can be regenerated with `npm install` and `npm run build`.

When sending the iPhone app, include `ios/SwitzerlandTripPlanner/`. Do not include Xcode derived data or user-specific Xcode workspace state.
