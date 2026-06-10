import MapKit
import SwiftUI

struct FullMapView: View {
    @Bindable var state: UserTripState
    @State private var position: MapCameraPosition = .automatic
    @State private var selectedSheet: MapSheet?

    private var day: DayPlan { TripEngine.effectiveDay(for: state) }
    private var stops: [RouteStop] { TripEngine.routeStops(for: day) }
    private var segments: [RouteSegment] { TripEngine.routeSegments(for: day) }
    private var labels: [String: String] { TripEngine.orderLabels(for: day) }

    var body: some View {
        NavigationStack {
            ZStack(alignment: .top) {
                Map(position: $position, interactionModes: [.pan, .zoom, .rotate]) {
                    ForEach(backgroundPlaces) { place in
                        Annotation(place.name, coordinate: place.coordinate) {
                            Circle()
                                .fill(Color.purple.opacity(0.72))
                                .frame(width: 18, height: 18)
                                .overlay(Circle().stroke(.white, lineWidth: 3))
                        }
                    }

                    ForEach(alternatePlaces) { place in
                        Annotation(place.name, coordinate: place.coordinate) {
                            Text("?")
                                .font(.caption.weight(.black))
                                .frame(width: 30, height: 30)
                                .background(.orange, in: Circle())
                                .overlay(Circle().stroke(.white, lineWidth: 3))
                        }
                    }

                    ForEach(segments) { segment in
                        MapPolyline(coordinates: [segment.from.coordinate, segment.to.coordinate])
                            .stroke(segment.index == state.selectedSegmentIndex ? .pink : .blue.opacity(0.72), lineWidth: segment.index == state.selectedSegmentIndex ? 7 : 4)
                    }

                    ForEach(uniqueActivePlaces) { place in
                        Annotation(place.name, coordinate: place.coordinate) {
                            Button {
                                Haptics.selection()
                                selectFirstOccurrence(of: place)
                            } label: {
                                RouteStopBadge(label: labels[place.id] ?? "•", selected: place.id == selectedPlace?.id)
                            }
                            .buttonStyle(.plain)
                            .accessibilityLabel("\(place.name), \(place.kind), stops \(labels[place.id] ?? "")")
                        }
                    }
                }
                .mapStyle(.standard(elevation: .realistic))
                .ignoresSafeArea(edges: .top)

                VStack(spacing: 10) {
                    DayPicker(state: state)
                    HStack {
                        GlassCard {
                            VStack(alignment: .leading, spacing: 4) {
                                Text(day.title)
                                    .font(.headline)
                                    .lineLimit(1)
                                Text(selectedCommuteText)
                                    .font(.caption)
                                    .foregroundStyle(.secondary)
                            }
                        }

                        Button {
                            fitRoute()
                        } label: {
                            Image(systemName: "scope")
                                .font(.headline)
                                .frame(width: 48, height: 48)
                                .background(.ultraThinMaterial, in: Circle())
                        }
                        .accessibilityLabel("Recenter map on selected route")
                    }
                    .padding(.horizontal)
                }
                .padding(.top, 8)

                VStack {
                    Spacer()
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 10) {
                            ForEach(segments) { segment in
                                Button {
                                    Haptics.selection()
                                    state.selectedSegmentIndex = segment.index
                                    state.selectedStopIndex = segment.index + 1
                                    selectedSheet = .commute(segment)
                                    focus(on: segment.to)
                                } label: {
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text(segment.leg?.duration ?? "Segment")
                                            .font(.caption.weight(.bold))
                                            .foregroundStyle(.teal)
                                        Text(segment.leg?.to ?? segment.to.name)
                                            .font(.subheadline.weight(.bold))
                                            .lineLimit(1)
                                    }
                                    .frame(width: 150, alignment: .leading)
                                    .padding(12)
                                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
                                }
                                .buttonStyle(.plain)
                            }
                        }
                        .padding()
                    }
                }
            }
            .navigationTitle("Map")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                Button("Route") { fitRoute() }
            }
            .onAppear(perform: fitRoute)
            .onChange(of: state.selectedDayID) { _, _ in fitRoute() }
            .onChange(of: state.mountainVariantRaw) { _, _ in fitRoute() }
            .onChange(of: state.includeHarderKulm) { _, _ in fitRoute() }
            .sheet(item: $selectedSheet) { sheet in
                switch sheet {
                case .place(let place):
                    PlaceDetailSheet(place: place)
                case .commute(let segment):
                    CommuteDetailSheet(segment: segment)
                }
            }
        }
    }

    private var selectedPlace: Place? {
        stops.indices.contains(state.selectedStopIndex) ? stops[state.selectedStopIndex].place : stops.first?.place
    }

    private var selectedCommuteText: String {
        guard segments.indices.contains(state.selectedSegmentIndex) else { return "Route ready offline" }
        let segment = segments[state.selectedSegmentIndex]
        return "\(segment.leg?.from ?? segment.from.name) → \(segment.leg?.to ?? segment.to.name)"
    }

    private var activeIDs: Set<String> {
        Set(day.route)
    }

    private var alternateIDs: Set<String> {
        day.id == 4 ? Set(["schilthorn", "jungfraujoch"]).subtracting(activeIDs) : []
    }

    private var alternatePlaces: [Place] {
        alternateIDs.compactMap { TripSeed.placeByID[$0] }
    }

    private var backgroundPlaces: [Place] {
        TripSeed.places.filter { !activeIDs.contains($0.id) && !alternateIDs.contains($0.id) }
    }

    private var uniqueActivePlaces: [Place] {
        var seen = Set<String>()
        return stops.compactMap { stop in
            guard !seen.contains(stop.place.id) else { return nil }
            seen.insert(stop.place.id)
            return stop.place
        }
    }

    private func selectFirstOccurrence(of place: Place) {
        let index = stops.first(where: { $0.place.id == place.id })?.index ?? 0
        state.selectedStopIndex = index
        state.selectedSegmentIndex = max(index - 1, 0)
        selectedSheet = .place(place)
        focus(on: place)
    }

    private func focus(on place: Place) {
        position = .camera(MapCamera(centerCoordinate: place.coordinate, distance: 42000))
    }

    private func fitRoute() {
        let focusPlaces = (stops.map(\.place) + alternatePlaces)
        guard !focusPlaces.isEmpty else { return }
        let minLat = focusPlaces.map(\.latitude).min() ?? 46.8
        let maxLat = focusPlaces.map(\.latitude).max() ?? 47.2
        let minLon = focusPlaces.map(\.longitude).min() ?? 7.6
        let maxLon = focusPlaces.map(\.longitude).max() ?? 8.4
        let center = CLLocationCoordinate2D(latitude: (minLat + maxLat) / 2, longitude: (minLon + maxLon) / 2)
        let span = MKCoordinateSpan(latitudeDelta: max(maxLat - minLat, 0.08) * 1.8, longitudeDelta: max(maxLon - minLon, 0.08) * 1.8)
        position = .region(MKCoordinateRegion(center: center, span: span))
    }
}

enum MapSheet: Identifiable {
    case place(Place)
    case commute(RouteSegment)

    var id: String {
        switch self {
        case .place(let place): return "place-\(place.id)"
        case .commute(let segment): return "commute-\(segment.id)"
        }
    }
}

struct PlaceDetailSheet: View {
    let place: Place

    var body: some View {
        NavigationStack {
            ScrollView {
                PlaceDetailCard(place: place)
                    .padding()
            }
            .navigationTitle(place.name)
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium, .large])
    }
}

struct CommuteDetailSheet: View {
    let segment: RouteSegment

    var body: some View {
        NavigationStack {
            GlassCard {
                VStack(alignment: .leading, spacing: 12) {
                    SectionHeader(title: "Commute", systemImage: segment.leg?.mode.symbol ?? "arrow.right")
                    Text("\(segment.leg?.from ?? segment.from.name) → \(segment.leg?.to ?? segment.to.name)")
                        .font(.title2.bold())
                    Text(segment.leg?.duration ?? "Route segment")
                        .font(.headline)
                        .foregroundStyle(.teal)
                    Text(segment.leg?.guidance ?? "Follow the route order for this segment.")
                        .foregroundStyle(.secondary)
                    Text("Offline fallback: \(segment.from.name) to \(segment.to.name)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
            .padding()
            .navigationTitle("Commute")
            .navigationBarTitleDisplayMode(.inline)
        }
        .presentationDetents([.medium])
    }
}
