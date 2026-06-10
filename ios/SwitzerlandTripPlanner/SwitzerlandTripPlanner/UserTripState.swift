import Foundation
import SwiftData

@Model
final class UserTripState {
    var selectedDayID: Int
    var selectedStopIndex: Int
    var selectedSegmentIndex: Int
    var weatherModeRaw: String
    var mountainVariantRaw: String
    var includeHarderKulm: Bool
    var bookingStatusesJSON: String
    var passSelectionsJSON: String
    var completedRemindersJSON: String

    init() {
        selectedDayID = 1
        selectedStopIndex = 0
        selectedSegmentIndex = 0
        weatherModeRaw = WeatherMode.clear.rawValue
        mountainVariantRaw = MountainVariant.schilthorn.rawValue
        includeHarderKulm = false
        bookingStatusesJSON = "{}"
        passSelectionsJSON = "[\"city\",\"rigi\",\"oberland\",\"schilthorn\",\"lake\",\"bern\"]"
        completedRemindersJSON = "[]"
    }
}

extension UserTripState {
    var weatherMode: WeatherMode {
        get { WeatherMode(rawValue: weatherModeRaw) ?? .clear }
        set { weatherModeRaw = newValue.rawValue }
    }

    var mountainVariant: MountainVariant {
        get { MountainVariant(rawValue: mountainVariantRaw) ?? .schilthorn }
        set { mountainVariantRaw = newValue.rawValue }
    }

    var bookingStatuses: [String: BookingStatus] {
        get {
            guard let data = bookingStatusesJSON.data(using: .utf8),
                  let raw = try? JSONDecoder().decode([String: String].self, from: data) else { return [:] }
            return raw.compactMapValues { BookingStatus(rawValue: $0) }
        }
        set {
            let raw = newValue.mapValues(\.rawValue)
            if let data = try? JSONEncoder().encode(raw), let string = String(data: data, encoding: .utf8) {
                bookingStatusesJSON = string
            }
        }
    }

    var passSelections: Set<String> {
        get {
            guard let data = passSelectionsJSON.data(using: .utf8),
                  let values = try? JSONDecoder().decode([String].self, from: data) else { return [] }
            return Set(values)
        }
        set {
            if let data = try? JSONEncoder().encode(Array(newValue)), let string = String(data: data, encoding: .utf8) {
                passSelectionsJSON = string
            }
        }
    }

    var completedReminders: Set<String> {
        get {
            guard let data = completedRemindersJSON.data(using: .utf8),
                  let values = try? JSONDecoder().decode([String].self, from: data) else { return [] }
            return Set(values)
        }
        set {
            if let data = try? JSONEncoder().encode(Array(newValue)), let string = String(data: data, encoding: .utf8) {
                completedRemindersJSON = string
            }
        }
    }

    func resetRouteSelection() {
        selectedStopIndex = 0
        selectedSegmentIndex = 0
    }
}
