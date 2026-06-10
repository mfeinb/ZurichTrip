import Foundation
import MapKit
import SwiftUI

enum TransportMode: String, Codable, CaseIterable {
    case train
    case boat
    case cogwheel
    case cableCar
    case funicular
    case walk
    case tram

    var symbol: String {
        switch self {
        case .train: return "tram.fill"
        case .boat: return "ferry.fill"
        case .cogwheel: return "mountain.2.fill"
        case .cableCar: return "cablecar.fill"
        case .funicular: return "tram.fill"
        case .walk: return "figure.walk"
        case .tram: return "tram.fill"
        }
    }
}

enum WeatherMode: String, Codable, CaseIterable, Identifiable {
    case clear
    case cloudy
    case rain

    var id: String { rawValue }

    var label: String {
        switch self {
        case .clear: return "Clear"
        case .cloudy: return "Cloudy"
        case .rain: return "Rain"
        }
    }
}

enum MountainVariant: String, Codable, CaseIterable, Identifiable {
    case schilthorn
    case jungfraujoch

    var id: String { rawValue }
    var label: String { self == .schilthorn ? "Schilthorn" : "Jungfraujoch" }
}

enum BookingStatus: String, Codable, CaseIterable, Identifiable {
    case todo
    case checking
    case booked

    var id: String { rawValue }

    var label: String {
        switch self {
        case .todo: return "To do"
        case .checking: return "Checking"
        case .booked: return "Booked"
        }
    }
}

struct Place: Identifiable, Codable, Hashable {
    let id: String
    let name: String
    let kind: String
    let region: String
    let latitude: Double
    let longitude: Double
    let role: String
    let note: String
    let bestFor: String
    let allow: String
    let dontMiss: [String]
    let practical: String
    let extraDetails: [String]

    var coordinate: CLLocationCoordinate2D {
        CLLocationCoordinate2D(latitude: latitude, longitude: longitude)
    }
}

struct TransitLeg: Identifiable, Codable, Hashable {
    var id: String { "\(from)-\(to)-\(mode.rawValue)" }
    let from: String
    let to: String
    let mode: TransportMode
    let duration: String
    let recommendedTime: String? = nil
    let guidance: String
}

struct PriceEstimate: Identifiable, Codable, Hashable {
    var id: String { label }
    let label: String
    let estimate: String
    let note: String
}

struct DecisionOption: Identifiable, Codable, Hashable {
    var id: String { title }
    let title: String
    let bestFor: String
    let tradeoff: String
    let logistics: String
}

struct BookingReminder: Identifiable, Codable, Hashable {
    var id: String { label }
    let label: String
    let priority: String
}

struct DayPlan: Identifiable, Codable, Hashable {
    let id: Int
    let date: String
    let title: String
    let base: String
    let summary: String
    let jawDrop: String
    let effort: String
    let weather: String
    let route: [String]
    let legs: [TransitLeg]
    let highlights: [String]
    let optionalAddOns: [String]
    let backup: String
    let priceEstimates: [PriceEstimate]
    let reminders: [BookingReminder]
    let decisions: [DecisionOption]
}

struct RouteStop: Identifiable, Hashable {
    let index: Int
    let place: Place
    var id: String { "\(place.id)-\(index)" }
}

struct RouteSegment: Identifiable, Hashable {
    let index: Int
    let from: Place
    let to: Place
    let leg: TransitLeg?
    var id: String { "\(from.id)-\(to.id)-\(index)" }
}

struct PassItem: Identifiable, Hashable {
    let id: String
    let label: String
    let swiss: Int
    let half: Int
    let saver: Int
    let point: Int
}

struct PassOption: Identifiable, Hashable {
    var id: String { name }
    let name: String
    let fit: String
    let goodFor: String
    let watchOut: String
}
