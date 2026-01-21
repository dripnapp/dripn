import ExpoModulesCore
import UnityAds

public class UnityAdsBridgeModule: Module {
  public func definition() -> ModuleDefinition {
    Name("UnityAdsBridge")

    AsyncFunction("initialize") { (gameId: String, testMode: Bool) -> Void in
      UnityAds.initialize(gameId, testMode: testMode)
    }

    AsyncFunction("load") { (placementId: String) -> Void in
      UnityAds.load(placementId)
    }

    AsyncFunction("show") { (placementId: String) -> Void in
      if let topVC = UIApplication.shared.windows.first?.rootViewController {
        UnityAds.show(topVC, placementId: placementId)
      }
    }

    AsyncFunction("setRewardListener") { (callback: @escaping (String, Double) -> Void) -> Void in
      // UnityAds has delegate - set it up
      UnityAds.setDelegate(UnityAdsBridgeDelegate(callback: callback))
    }
  }
}

class UnityAdsBridgeDelegate: NSObject, UnityAdsDelegate {
  let callback: (String, Double) -> Void

  init(callback: @escaping (String, Double) -> Void) {
    self.callback = callback
  }

  func unityAdsReady(placementId: String) {
    print("UnityAds ready for placement: \(placementId)")
  }

  func unityAdsDidStart(placementId: String) {
    print("UnityAds started for placement: \(placementId)")
  }

  func unityAdsDidFinish(placementId: String, withFinishState state: UnityAdsFinishState) {
    if state == .completed {
      // Reward amount is usually fixed per placement - adjust as needed
      callback(placementId, 5.0) // Example: 5 drips
    }
  }

  func unityAdsDidError(_ error: Error, withMessage message: String) {
    print("UnityAds error: \(message)")
  }
}