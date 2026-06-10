import SwiftData
import SwiftUI

struct TripHomeView: View {
    @Bindable var state: UserTripState
    @State private var showingShare = false

    private var day: DayPlan { TripEngine.effectiveDay(for: state) }
    private var stops: [RouteStop] { TripEngine.routeStops(for: day) }
    private var segments: [RouteSegment] { TripEngine.routeSegments(for: day) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    DayPicker(state: state)

                    GlassCard {
                        VStack(alignment: .leading, spacing: 12) {
                            Text(day.date.uppercased())
                                .font(.caption.weight(.bold))
                                .foregroundStyle(.teal)
                            Text(day.title)
                                .font(.largeTitle.bold())
                                .minimumScaleFactor(0.78)
                            Chip(text: day.base, tint: .blue)
                            Text(day.summary)
                                .font(.body)
                                .foregroundStyle(.secondary)
                            HStack {
                                Label(day.effort, systemImage: "figure.walk")
                                Spacer()
                                Button {
                                    showingShare = true
                                } label: {
                                    Label("Share", systemImage: "square.and.arrow.up")
                                }
                                .buttonStyle(.borderedProminent)
                                .controlSize(.small)
                            }
                            .font(.subheadline.weight(.semibold))
                        }
                    }

                    RouteOrderCard(state: state, day: day, stops: stops)
                    CommuteCard(state: state, segments: segments)
                    PlaceDetailCard(place: selectedPlace)
                    DayInsightCard(day: day)
                    LuggageCard(dayID: day.id)
                }
                .padding()
            }
            .background(LinearGradient(colors: [.teal.opacity(0.12), .blue.opacity(0.08), .clear], startPoint: .top, endPoint: .bottom))
            .navigationTitle("Swiss Planner")
            .sheet(isPresented: $showingShare) {
                ShareSheet(items: [TripEngine.shareText(for: day, state: state)])
            }
        }
    }

    private var selectedPlace: Place {
        let safeIndex = min(max(state.selectedStopIndex, 0), max(stops.count - 1, 0))
        return stops.isEmpty ? TripSeed.places[0] : stops[safeIndex].place
    }
}

struct DayPicker: View {
    @Bindable var state: UserTripState

    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 10) {
                ForEach(TripSeed.dayPlans) { day in
                    Button {
                        Haptics.selection()
                        state.selectedDayID = day.id
                        state.resetRouteSelection()
                    } label: {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("Day \(day.id)")
                                .font(.caption.weight(.black))
                                .foregroundStyle(day.id == state.selectedDayID ? .white : .teal)
                            Text(day.date)
                                .font(.caption)
                            Text(day.title)
                                .font(.subheadline.weight(.bold))
                                .lineLimit(2)
                        }
                        .frame(width: 142, alignment: .leading)
                        .padding(12)
                        .background(day.id == state.selectedDayID ? Color.teal : Color.white.opacity(0.52), in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                        .foregroundStyle(day.id == state.selectedDayID ? .white : .primary)
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Select day \(day.id), \(day.title)")
                }
            }
            .padding(.horizontal, 2)
        }
    }
}

struct RouteOrderCard: View {
    @Bindable var state: UserTripState
    let day: DayPlan
    let stops: [RouteStop]

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Route order", systemImage: "point.topleft.down.curvedto.point.bottomright.up")
                ForEach(stops) { stop in
                    Button {
                        Haptics.selection()
                        state.selectedStopIndex = stop.index
                        state.selectedSegmentIndex = max(stop.index - 1, 0)
                    } label: {
                        HStack(alignment: .top, spacing: 12) {
                            RouteStopBadge(label: "\(stop.index + 1)", selected: stop.index == state.selectedStopIndex)
                            VStack(alignment: .leading, spacing: 4) {
                                Text(stop.place.name)
                                    .font(.headline)
                                Chip(text: stop.place.kind)
                                Text(stop.place.note)
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

struct CommuteCard: View {
    @Bindable var state: UserTripState
    let segments: [RouteSegment]

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Commutes", systemImage: "tram.fill")
                ForEach(segments) { segment in
                    Button {
                        Haptics.selection()
                        state.selectedSegmentIndex = segment.index
                        state.selectedStopIndex = segment.index + 1
                    } label: {
                        HStack(alignment: .top, spacing: 12) {
                            Image(systemName: segment.leg?.mode.symbol ?? "arrow.right")
                                .frame(width: 34, height: 34)
                                .background(.teal.opacity(0.14), in: RoundedRectangle(cornerRadius: 12))
                            VStack(alignment: .leading, spacing: 4) {
                                Text("\(segment.leg?.from ?? segment.from.name) → \(segment.leg?.to ?? segment.to.name)")
                                    .font(.headline)
                                Text(segment.leg?.duration ?? "Route segment")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(.secondary)
                                Text(segment.leg?.guidance ?? "")
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Spacer()
                        }
                        .padding(10)
                        .background(segment.index == state.selectedSegmentIndex ? Color.pink.opacity(0.12) : Color.clear, in: RoundedRectangle(cornerRadius: 18))
                    }
                    .buttonStyle(.plain)
                }
            }
        }
    }
}

struct PlaceDetailCard: View {
    let place: Place

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Place info", systemImage: "mappin.and.ellipse")
                HStack {
                    Chip(text: place.kind)
                    Chip(text: place.region, tint: .blue)
                }
                Text(place.name)
                    .font(.title.bold())
                Text(place.bestFor)
                    .foregroundStyle(.secondary)
                Text("Allow: \(place.allow)")
                    .font(.headline)
                Text(place.practical)
                    .foregroundStyle(.secondary)
                FlowChips(items: place.dontMiss)
                ForEach(place.extraDetails, id: \.self) { detail in
                    Text(detail)
                        .font(.subheadline)
                        .padding(.leading, 10)
                        .overlay(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 2).fill(.teal.opacity(0.55)).frame(width: 3)
                        }
                }
            }
        }
    }
}

struct DayInsightCard: View {
    let day: DayPlan

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 14) {
                SectionHeader(title: "Planning details", systemImage: "sparkles")
                Text(day.jawDrop)
                    .font(.headline)
                Text(day.weather)
                    .foregroundStyle(.secondary)
                FlowChips(items: day.highlights)
                if !day.optionalAddOns.isEmpty {
                    VStack(alignment: .leading, spacing: 8) {
                        Label("Optional Add-ons", systemImage: "plus.circle")
                            .font(.subheadline.weight(.bold))
                        FlowChips(items: day.optionalAddOns)
                    }
                    .padding(.top, 2)
                }
                VStack(alignment: .leading, spacing: 10) {
                    ForEach(day.priceEstimates) { estimate in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(estimate.label).font(.subheadline.weight(.bold))
                            Text(estimate.estimate).font(.headline).foregroundStyle(.green)
                            Text(estimate.note).font(.caption).foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .padding(12)
                        .background(.white.opacity(0.48), in: RoundedRectangle(cornerRadius: 16))
                    }
                }
            }
        }
    }
}

struct LuggageCard: View {
    let dayID: Int

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 10) {
                SectionHeader(title: "Luggage notes", systemImage: "suitcase.rolling.fill")
                ForEach(TripEngine.luggageNotes(dayID: dayID), id: \.self) { note in
                    Label(note, systemImage: "checkmark.circle")
                        .font(.subheadline)
                }
            }
        }
    }
}

struct FlowChips: View {
    let items: [String]

    var body: some View {
        LazyVGrid(columns: [GridItem(.adaptive(minimum: 120), spacing: 8)], alignment: .leading, spacing: 8) {
            ForEach(items, id: \.self) { item in
                Chip(text: item, tint: .blue)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
    }
}
