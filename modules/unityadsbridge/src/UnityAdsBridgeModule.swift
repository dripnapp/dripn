import ExpoModulesCore
import UnityAds

public class UnityAdsBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("UnityAdsBridge")

    AsyncFunction("initialize") { (gameId: String, testMode: Bool) -> Void in
      UnityAds.initialize(gameId, testMode: testMode, initializationDelegate: self)
    }

    AsyncFunction("loadRewarded") { (placementId: String) -> Void in
      UnityAds.load(placementId, loadDelegate: self)
    }

    AsyncFunction("showRewarded") { (placementId: String) -> Void in
      if let rootVC = UIApplication.shared.windows.first?.rootViewController {
        UnityAds.show(rootVC, placementId: placementId, showDelegate: self)
      }
    }

    Events("onInitializationComplete", "onInitializationFailed", "onReward", "onAdClosed", "onAdFailed")
  }
}

extension UnityAdsBridgeModule: UnityAdsInitializationDelegate {
  public func initializationComplete() {
    sendEvent("onInitializationComplete", [:])
    print("Unity Ads initialization complete")
  }

  public func initializationFailed(_ error: UnityAdsInitializationError, withMessage: String) {
    sendEvent("onInitializationFailed", ["error": error.localizedDescription, "message": withMessage])
    print("Unity Ads initialization failed: \(error.localizedDescription) - \(withMessage)")
  }
}

extension UnityAdsBridgeModule: UnityAdsLoadDelegate {
  public func unityAdsAdLoaded(_ placementId: String) {
    print("Unity Ads ad loaded for placement: \(placementId)")
  }

  public func unityAdsAdFailedToLoad(_ placementId: String, error: UnityAdsLoadError, message: String) {
    sendEvent("onAdFailed", ["placementId": placementId, "error": message])
    print("Unity Ads ad failed to load for placement: \(placementId) - \(message)")
  }
}

extension UnityAdsBridgeModule: UnityAdsShowDelegate {
  public func unityAdsShowStart(_ placementId: String) {
    print("Unity Ads show started for placement: \(placementId)")
  }

  public func unityAdsShowClick(_ placementId: String) {
    print("Unity Ads show clicked for placement: \(placementId)")
  }

  public func unityAdsShowComplete(_ placementId: String, state: UnityAdsShowCompletionState) {
    sendEvent("onAdClosed", ["placementId": placementId, "state": state.rawValue])
    if state == .completed {
      sendEvent("onReward", ["placementId": placementId, "amount": 5.0])  // Adjust amount as needed
      print("Unity Ads reward completed for placement: \(placementId)")
    }
    print("Unity Ads show completed for placement: \(placementId)")
  }

  public func unityAdsShowFailed(_ placementId: String, error: UnityAdsShowError, message: String) {
    sendEvent("onAdFailed", ["placementId": placementId, "error": message])
    print("Unity Ads show failed for placement: \(placementId) - \(message)")
  }
}