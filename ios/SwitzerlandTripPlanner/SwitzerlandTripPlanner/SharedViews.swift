import SwiftUI
import UIKit

struct GlassCard<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(16)
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 28, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 28, style: .continuous)
                    .stroke(.white.opacity(0.32), lineWidth: 1)
            )
            .shadow(color: .black.opacity(0.08), radius: 18, x: 0, y: 10)
    }
}

struct SectionHeader: View {
    let title: String
    let systemImage: String

    var body: some View {
        Label(title, systemImage: systemImage)
            .font(.headline)
            .foregroundStyle(.primary)
            .accessibilityAddTraits(.isHeader)
    }
}

struct Chip: View {
    let text: String
    var tint: Color = .teal

    var body: some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(tint.opacity(0.14), in: Capsule())
            .foregroundStyle(tint)
    }
}

struct RouteStopBadge: View {
    let label: String
    let selected: Bool

    var body: some View {
        Text(label)
            .font(.caption.weight(.black))
            .foregroundStyle(selected ? .white : .teal)
            .frame(width: selected ? 38 : 32, height: selected ? 38 : 32)
            .background(selected ? Color.pink : Color.teal.opacity(0.14), in: Circle())
            .overlay(Circle().stroke(.white.opacity(0.8), lineWidth: 2))
            .animation(.spring(response: 0.28, dampingFraction: 0.82), value: selected)
    }
}

struct ShareSheet: UIViewControllerRepresentable {
    let items: [Any]

    func makeUIViewController(context: Context) -> UIActivityViewController {
        UIActivityViewController(activityItems: items, applicationActivities: nil)
    }

    func updateUIViewController(_ uiViewController: UIActivityViewController, context: Context) {}
}

enum Haptics {
    static func selection() {
        UISelectionFeedbackGenerator().selectionChanged()
    }
}
