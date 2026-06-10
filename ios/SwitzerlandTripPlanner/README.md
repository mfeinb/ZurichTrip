# Switzerland Trip Planner iPhone App

Native SwiftUI version of the Switzerland trip planner.

## Requirements

- macOS with full Xcode installed
- Xcode selected as the active developer directory
- iOS Simulator or a connected iPhone

If `xcodebuild` complains about Command Line Tools, run:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

## Run Locally

1. Open `SwitzerlandTripPlanner.xcodeproj` in Xcode.
2. Choose the `SwitzerlandTripPlanner` scheme.
3. Select an iPhone simulator.
4. Press Run.

For a physical iPhone, select your Apple development team in Xcode's Signing & Capabilities settings before running.

## What It Includes

- Native SwiftUI tab app: Trip, Map, Decisions, Bookings
- MapKit route map with numbered route stops and highlighted commutes
- Day 4 Schilthorn / Jungfraujoch toggle
- Day 5 optional Harder Kulm toggle
- Weather decision guidance
- Place detail sheets with plain-language place types
- Price estimates
- Pass comparison helper
- Booking status tracker
- Luggage notes
- Share sheet for the selected day
- SwiftData persistence for local planning choices

## Files

```text
SwitzerlandTripPlannerApp.swift  App entry point and SwiftData container
Models.swift                     Trip, place, commute, decision, and price models
TripSeed.swift                   Offline bundled itinerary data
UserTripState.swift              SwiftData user choices and checklist state
ContentView.swift                Tab shell and route variant engine
TripViews.swift                  Selected-day planner UI
MapViews.swift                   MapKit route map, markers, commute sheets
DecisionViews.swift              Weather, mountain, Harder Kulm, and pass panels
BookingViews.swift               Booking tracker and current-day export
SharedViews.swift                Glass cards, chips, haptics, share sheet
```

## Notes

- Trip data is bundled in Swift source for offline use.
- Apple Maps tiles still need network availability.
- If map tiles fail, the Trip tab still has the full route order and commute details.
- Price estimates are planning ranges and should be verified before booking.
- The UI uses native SwiftUI materials and system components for a Liquid Glass-inspired feel. The exact Apple Liquid Glass APIs available depend on the installed Xcode and iOS SDK.
