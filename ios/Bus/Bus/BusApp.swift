import SwiftUI

@main
struct BusApp: App {
    var body: some Scene {
        WindowGroup {
            WebViewScreen()
                .ignoresSafeArea()
        }
    }
}
