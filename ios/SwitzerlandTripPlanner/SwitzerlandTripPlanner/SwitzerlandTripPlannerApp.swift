import SwiftData
import SwiftUI

@main
struct SwitzerlandTripPlannerApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
        }
        .modelContainer(for: UserTripState.self)
    }
}
