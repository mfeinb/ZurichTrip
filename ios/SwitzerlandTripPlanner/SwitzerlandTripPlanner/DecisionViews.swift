import SwiftUI

struct DecisionsView: View {
    @Bindable var state: UserTripState

    private var day: DayPlan { TripEngine.effectiveDay(for: state) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    DayPicker(state: state)
                    WeatherDecisionCard(state: state, day: day)
                    RouteVariantCard(state: state, day: day)
                    PassCalculatorCard(state: state)
                    PassComparisonCard()
                }
                .padding()
            }
            .background(LinearGradient(colors: [.blue.opacity(0.08), .teal.opacity(0.08), .clear], startPoint: .top, endPoint: .bottom))
            .navigationTitle("Decisions")
        }
    }
}

struct WeatherDecisionCard: View {
    @Bindable var state: UserTripState
    let day: DayPlan

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Weather decision", systemImage: "cloud.sun.fill")
                Picker("Weather", selection: Binding(
                    get: { state.weatherMode },
                    set: { state.weatherMode = $0 }
                )) {
                    ForEach(WeatherMode.allCases) { mode in
                        Text(mode.label).tag(mode)
                    }
                }
                .pickerStyle(.segmented)

                Text(TripEngine.weatherAdvice(dayID: day.id, mode: state.weatherMode))
                    .font(.headline)
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(.blue.opacity(0.1), in: RoundedRectangle(cornerRadius: 18))
            }
        }
    }
}

struct RouteVariantCard: View {
    @Bindable var state: UserTripState
    let day: DayPlan

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Route variants", systemImage: "arrow.triangle.branch")

                if day.id == 4 {
                    Picker("Mountain route", selection: Binding(
                        get: { state.mountainVariant },
                        set: {
                            Haptics.selection()
                            state.mountainVariant = $0
                            state.resetRouteSelection()
                        }
                    )) {
                        ForEach(MountainVariant.allCases) { variant in
                            Text(variant.label).tag(variant)
                        }
                    }
                    .pickerStyle(.segmented)

                    ForEach(day.decisions) { option in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(option.title).font(.headline)
                            Text(option.bestFor).foregroundStyle(.secondary)
                            Text(option.tradeoff).font(.caption).foregroundStyle(.orange)
                            Text(option.logistics).font(.caption).foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(.white.opacity(0.48), in: RoundedRectangle(cornerRadius: 16))
                    }
                } else if day.id == 5 {
                    Toggle(isOn: Binding(
                        get: { state.includeHarderKulm },
                        set: {
                            Haptics.selection()
                            state.includeHarderKulm = $0
                            state.resetRouteSelection()
                        }
                    )) {
                        VStack(alignment: .leading) {
                            Text("Include Harder Kulm before Bern")
                                .font(.headline)
                            Text("Optional funicular viewpoint; keep off if timing feels tight.")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .toggleStyle(.switch)
                } else {
                    Text("No major route variant for this day. Use the weather and luggage guidance to keep it smooth.")
                        .foregroundStyle(.secondary)
                }
            }
        }
    }
}

struct PassCalculatorCard: View {
    @Bindable var state: UserTripState

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Pass calculator", systemImage: "swissfranc.circle.fill")
                Text("Fit scores, not quotes. Use these to decide what to price in SBB/Jungfrau apps.")
                    .font(.caption)
                    .foregroundStyle(.secondary)

                ForEach(TripSeed.passItems) { item in
                    Toggle(isOn: Binding(
                        get: { state.passSelections.contains(item.id) },
                        set: { isOn in
                            var next = state.passSelections
                            if isOn { next.insert(item.id) } else { next.remove(item.id) }
                            state.passSelections = next
                        }
                    )) {
                        Text(item.label)
                    }
                }

                LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                    ScoreTile(name: "Swiss Travel Pass", score: score(\.swiss))
                    ScoreTile(name: "Half Fare Card", score: score(\.half))
                    ScoreTile(name: "Saver Day Passes", score: score(\.saver))
                    ScoreTile(name: "Point-to-point", score: score(\.point))
                }
            }
        }
    }

    private func score(_ keyPath: KeyPath<PassItem, Int>) -> Int {
        TripSeed.passItems
            .filter { state.passSelections.contains($0.id) }
            .reduce(0) { $0 + $1[keyPath: keyPath] }
    }
}

struct ScoreTile: View {
    let name: String
    let score: Int

    var label: String {
        if score >= 13 { return "Strong fit" }
        if score >= 9 { return "Possible fit" }
        return "Weak fit"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(name).font(.headline)
            Chip(text: label, tint: score >= 13 ? .green : .orange)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(12)
        .background(.white.opacity(0.52), in: RoundedRectangle(cornerRadius: 18))
    }
}

struct PassComparisonCard: View {
    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Pass comparison", systemImage: "ticket.fill")
                ForEach(TripSeed.passOptions) { option in
                    VStack(alignment: .leading, spacing: 6) {
                        Text(option.name).font(.headline)
                        Text(option.fit).foregroundStyle(.secondary)
                        Text(option.goodFor).font(.caption.weight(.semibold)).foregroundStyle(.green)
                        Text(option.watchOut).font(.caption).foregroundStyle(.orange)
                    }
                    .padding(12)
                    .background(.white.opacity(0.45), in: RoundedRectangle(cornerRadius: 16))
                }
            }
        }
    }
}
