import ExpoModulesCore
// import UnityAds

public class UnityAdsBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("UnityAdsBridge")

    AsyncFunction("initialize") { (gameId: String, testMode: Bool) in
      // UnityAds.initialize(gameId: gameId, testMode: testMode, initializationDelegate: self)
    }

    AsyncFunction("loadRewarded") { (placementId: String) in
      // UnityAds.load(placementId: placementId, loadDelegate: self)
    }

    AsyncFunction("showRewarded") { (placementId: String) in
      guard let rootVC = UIApplication.shared.connectedScenes
        .compactMap({ $0 as? UIWindowScene })
        .first?.windows
        .filter({ $0.isKeyWindow }).first?.rootViewController else {
        print("No root view controller found")
        return
      }
      // UnityAds.show(rootVC, placementId: placementId, showDelegate: self)
    }

    Events("onInitComplete", "onInitFailed", "onAdLoaded", "onAdLoadFailed", "onAdShowStart", "onAdShowClick", "onAdShowComplete", "onAdShowFailed")
  }
}

// MARK: - Initialization Delegate
// extension UnityAdsBridgeModule: UnityAdsInitializationDelegate {
  public func initializationComplete() {
    sendEvent("onInitComplete", [:])
    print("Unity Ads initialization complete")
  }

  public func initializationFailed(_ error: UnityAdsInitializationError, withMessage message: String) {
    sendEvent("onInitFailed", ["error": message])
    print("Unity Ads initialization failed: \(message)")
  }
}

// MARK: - Load Delegate
// extension UnityAdsBridgeModule: UnityAdsLoadDelegate {
  public func unityAdsAdLoaded(_ placementId: String) {
    sendEvent("onAdLoaded", ["placementId": placementId])
    print("Unity Ads ad loaded: \(placementId)")
  }

  public func unityAdsAdFailed(toLoad placementId: String, withError error: UnityAdsLoadError, withMessage message: String) {
    sendEvent("onAdLoadFailed", ["placementId": placementId, "error": message])
    print("Unity Ads ad failed to load: \(placementId) - \(message)")
  }
}

// MARK: - Show Delegate
// extension UnityAdsBridgeModule: UnityAdsShowDelegate {
  public func unityAdsShowStart(_ placementId: String) {
    sendEvent("onAdShowStart", ["placementId": placementId])
    print("Unity Ads show started: \(placementId)")
  }

  public func unityAdsShowClick(_ placementId: String) {
    sendEvent("onAdShowClick", ["placementId": placementId])
    print("Unity Ads show clicked: \(placementId)")
  }

  public func unityAdsShowComplete(_ placementId: String, withFinish state: UnityAdsShowCompletionState) {
    sendEvent("onAdShowComplete", ["placementId": placementId, "state": state.rawValue])
    if state == .completed {
      sendEvent("onReward", ["placementId": placementId, "amount": 5.0]) // Adjust reward amount
      print("Unity Ads reward completed for: \(placementId)")
    }
    print("Unity Ads show complete: \(placementId) - state: \(state.rawValue)")
  }

  public func unityAdsShowFailed(_ placementId: String, withError error: UnityAdsShowError, withMessage message: String) {
    sendEvent("onAdShowFailed", ["placementId": placementId, "error": message])
    print("Unity Ads show failed: \(placementId) - \(message)")
  }
}