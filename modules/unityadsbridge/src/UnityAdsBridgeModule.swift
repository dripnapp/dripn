import ExpoModulesCore

public class UnityAdsBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("UnityAdsBridge")

    // All methods commented out until we re-enable Unity
    AsyncFunction("initialize") { (gameId: String, testMode: Bool) in
      // UnityAds.initialize(gameId: gameId, testMode: testMode, initializationDelegate: self)
    }

    AsyncFunction("loadRewarded") { (placementId: String) in
      // UnityAds.load(placementId: placementId, loadDelegate: self)
    }

    AsyncFunction("showRewarded") { (placementId: String) in
      // UnityAds.show(...)
    }

    Events("onInitComplete", "onInitFailed", "onAdLoaded", "onAdLoadFailed", "onAdShowStart", "onAdShowClick", "onAdShowComplete", "onAdShowFailed")
  }
}

// No delegate extensions — UnityAds types are missing