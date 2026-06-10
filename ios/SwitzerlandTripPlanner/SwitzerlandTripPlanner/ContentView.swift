import SwiftData
import SwiftUI

struct ContentView: View {
    @Environment(\.modelContext) private var modelContext
    @Query private var states: [UserTripState]

    var body: some View {
        Group {
            if let state = states.first {
                PlannerShell(state: state)
            } else {
                ProgressView("Preparing trip planner")
                    .task {
                        modelContext.insert(UserTripState())
                    }
            }
        }
    }
}

struct PlannerShell: View {
    @Bindable var state: UserTripState

    var selectedDay: DayPlan {
        TripEngine.effectiveDay(for: state)
    }

    var body: some View {
        TabView {
            TripHomeView(state: state)
                .tabItem { Label("Trip", systemImage: "calendar") }

            FullMapView(state: state)
                .tabItem { Label("Map", systemImage: "map") }

            DecisionsView(state: state)
                .tabItem { Label("Decisions", systemImage: "cloud.sun") }

            BookingsView(state: state)
                .tabItem { Label("Bookings", systemImage: "checklist") }
        }
        .tint(.teal)
    }
}

enum TripEngine {
    static func baseDay(id: Int) -> DayPlan {
        TripSeed.dayPlans.first(where: { $0.id == id }) ?? TripSeed.dayPlans[0]
    }

    static func effectiveDay(for state: UserTripState) -> DayPlan {
        effectiveDay(base: baseDay(id: state.selectedDayID), state: state)
    }

    static func effectiveDay(base: DayPlan, state: UserTripState) -> DayPlan {
        if base.id == 4, state.mountainVariant == .jungfraujoch {
            return DayPlan(
                id: base.id,
                date: base.date,
                title: "Jungfraujoch weather-window day",
                base: base.base,
                summary: "Use this only if webcams and forecast are strong: it is the iconic glacier day, but also the costliest and most weather-sensitive.",
                jawDrop: "Jungfraujoch gives the glacier and high-Alpine station experience.",
                effort: base.effort,
                weather: base.weather,
                route: ["lauterbrunnen", "jungfraujoch", "lauterbrunnen"],
                legs: [
                    TransitLeg(from: "Lauterbrunnen", to: "Jungfraujoch", mode: .train, duration: "Most of the day", guidance: "Price with your pass and only commit if visibility is excellent."),
                    TransitLeg(from: "Jungfraujoch", to: "Lauterbrunnen", mode: .train, duration: "Most of the day", guidance: "Return with a generous margin.")
                ],
                highlights: ["Glacier station", "Aletsch Glacier", "High-Alpine views"],
                optionalAddOns: base.optionalAddOns,
                backup: base.backup,
                priceEstimates: base.priceEstimates,
                reminders: base.reminders,
                decisions: base.decisions
            )
        }

        if base.id == 5, state.includeHarderKulm {
            return DayPlan(
                id: base.id,
                date: base.date,
                title: "Lake Brienz, Harder Kulm, then Bern",
                base: base.base,
                summary: "Add Harder Kulm only if Lake Brienz timing, weather, and energy all look good before continuing to Bern.",
                jawDrop: base.jawDrop,
                effort: base.effort,
                weather: base.weather,
                route: ["lauterbrunnen", "interlaken", "brienz", "interlaken", "harder", "interlaken", "bern"],
                legs: [
                    base.legs[0],
                    base.legs[1],
                    base.legs[2],
                    TransitLeg(from: "Interlaken Ost", to: "Harder Kulm", mode: .funicular, duration: "~10 min each way", guidance: "Use as a quick viewpoint if visibility is good and energy remains."),
                    TransitLeg(from: "Harder Kulm", to: "Interlaken Ost", mode: .funicular, duration: "~10 min", guidance: "Return to Interlaken Ost before the Bern train."),
                    base.legs[3]
                ],
                highlights: ["Lake Brienz cruise", "Harder Kulm", "Bern evening"],
                optionalAddOns: base.optionalAddOns,
                backup: "Skip Harder Kulm if it would make the Bern transfer feel rushed.",
                priceEstimates: base.priceEstimates,
                reminders: base.reminders,
                decisions: base.decisions
            )
        }

        return base
    }

    static func routeStops(for day: DayPlan) -> [RouteStop] {
        day.route.enumerated().compactMap { index, placeID in
            guard let place = TripSeed.placeByID[placeID] else { return nil }
            return RouteStop(index: index, place: place)
        }
    }

    static func routeSegments(for day: DayPlan) -> [RouteSegment] {
        let stops = routeStops(for: day)
        return stops.dropLast().enumerated().map { offset, stop in
            RouteSegment(index: offset, from: stop.place, to: stops[offset + 1].place, leg: day.legs.indices.contains(offset) ? day.legs[offset] : nil)
        }
    }

    static func orderLabels(for day: DayPlan) -> [String: String] {
        var labels: [String: [String]] = [:]
        for (index, id) in day.route.enumerated() {
            labels[id, default: []].append(String(index + 1))
        }
        return labels.mapValues { $0.joined(separator: "/") }
    }

    static func weatherAdvice(dayID: Int, mode: WeatherMode) -> String {
        switch (dayID, mode) {
        case (4, .clear): return "Choose Schilthorn for simpler drama or Jungfraujoch for the glacier bucket list."
        case (4, .cloudy): return "Use webcams. Stay lower in Mürren or Wengen if upper stations disappear."
        case (4, .rain): return "Skip expensive summit tickets; use villages, waterfalls, and indoor breaks."
        case (5, .clear): return "Do Lake Brienz and add Harder Kulm only if the sky stays open before Bern."
        case (5, .cloudy): return "Lake Brienz still works; keep Harder optional and protect the Bern transfer."
        case (5, .rain): return "Shorten the lake plan and transfer to Bern earlier."
        case (_, .clear): return "Use the main scenic plan and keep enough buffer for transfers."
        case (_, .cloudy): return "Keep the route flexible and avoid buying weather-sensitive tickets too early."
        case (_, .rain): return "Favor covered streets, cafes, backup sights, and earlier transfers."
        }
    }

    static func luggageNotes(dayID: Int) -> [String] {
        switch dayID {
        case 1: return ["Travel light from Zurich work to Lucerne.", "A Lucerne station/lakefront hotel makes the next morning easier."]
        case 2: return ["Wake up already in Lucerne.", "Leave luggage at the hotel before Rigi."]
        case 3: return ["Pack for quick rail transfers.", "Keep Lauterbrunnen lodging practical."]
        case 4: return ["Carry warm layers, sunglasses, water, and rain shell.", "Avoid heavy bags on mountain lifts."]
        case 5: return ["Use Interlaken Ost lockers if needed.", "Keep Bern hotel close to station or old town."]
        default: return ["Use Bern hotel storage or lockers.", "Return to Zurich early enough for departure buffer."]
        }
    }

    static func shareText(for day: DayPlan, state: UserTripState) -> String {
        let legs = day.legs.map { "\($0.from) -> \($0.to) (\($0.duration))" }.joined(separator: "\n")
        return """
        \(day.date): \(day.title)
        \(day.base)

        \(day.summary)

        Commutes:
        \(legs)

        Weather: \(weatherAdvice(dayID: day.id, mode: state.weatherMode))
        Luggage: \(luggageNotes(dayID: day.id).joined(separator: " "))
        """
    }
}
