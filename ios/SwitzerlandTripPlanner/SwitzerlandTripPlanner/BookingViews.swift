import SwiftUI

struct BookingsView: View {
    @Bindable var state: UserTripState

    private var day: DayPlan { TripEngine.effectiveDay(for: state) }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 16) {
                    BookingStatusCard(state: state)
                    ReminderCard(state: state, day: day)
                    CurrentDayExportCard(state: state, day: day)
                }
                .padding()
            }
            .background(LinearGradient(colors: [.teal.opacity(0.1), .clear], startPoint: .top, endPoint: .bottom))
            .navigationTitle("Bookings")
        }
    }
}

struct BookingStatusCard: View {
    @Bindable var state: UserTripState

    var counts: (booked: Int, checking: Int, todo: Int) {
        let statuses = state.bookingStatuses
        let booked = statuses.values.filter { $0 == .booked }.count
        let checking = statuses.values.filter { $0 == .checking }.count
        return (booked, checking, TripSeed.bookingItems.count - booked - checking)
    }

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Booking status", systemImage: "checklist")
                Text("Booked \(counts.booked) / Checking \(counts.checking) / To do \(counts.todo)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(.secondary)

                ForEach(TripSeed.bookingItems, id: \.self) { item in
                    HStack {
                        Text(item)
                            .font(.subheadline)
                        Spacer()
                        Picker(item, selection: Binding(
                            get: { state.bookingStatuses[item] ?? .todo },
                            set: { status in
                                var next = state.bookingStatuses
                                next[item] = status
                                state.bookingStatuses = next
                            }
                        )) {
                            ForEach(BookingStatus.allCases) { status in
                                Text(status.label).tag(status)
                            }
                        }
                        .labelsHidden()
                        .pickerStyle(.menu)
                    }
                    .padding(12)
                    .background(.white.opacity(0.45), in: RoundedRectangle(cornerRadius: 16))
                }
            }
        }
    }
}

struct ReminderCard: View {
    @Bindable var state: UserTripState
    let day: DayPlan

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Today checklist", systemImage: "checkmark.circle.fill")
                ForEach(day.reminders) { reminder in
                    Toggle(isOn: Binding(
                        get: { state.completedReminders.contains(reminder.label) },
                        set: { isOn in
                            var next = state.completedReminders
                            if isOn { next.insert(reminder.label) } else { next.remove(reminder.label) }
                            state.completedReminders = next
                        }
                    )) {
                        VStack(alignment: .leading) {
                            Text(reminder.label)
                            Text(reminder.priority.capitalized)
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(reminder.priority == "must" ? .red : .orange)
                        }
                    }
                }
            }
        }
    }
}

struct CurrentDayExportCard: View {
    @Bindable var state: UserTripState
    let day: DayPlan
    @State private var showingShare = false

    var body: some View {
        GlassCard {
            VStack(alignment: .leading, spacing: 12) {
                SectionHeader(title: "Share current day", systemImage: "square.and.arrow.up")
                Text(TripEngine.shareText(for: day, state: state))
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .textSelection(.enabled)
                Button {
                    showingShare = true
                } label: {
                    Label("Open Share Sheet", systemImage: "square.and.arrow.up")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
            }
        }
        .sheet(isPresented: $showingShare) {
            ShareSheet(items: [TripEngine.shareText(for: day, state: state)])
        }
    }
}
