Pod::Spec.new do |s|
  s.name             = 'unityadsbridge'
  s.version          = '1.0.0'
  s.summary          = 'Expo native bridge for Unity Ads'
  s.homepage         = 'https://dripnapp.com'
  s.author           = ''
  s.source           = { :path => '.' }
  s.source_files     = 'src/UnityAdsBridgeModule.swift'
  s.platforms        = { :ios => '13.0' }
  s.license          = { :type => 'MIT', :file => 'LICENSE' }
  s.dependency 'ExpoModulesCore'
  # s.dependency 'UnityAds', '~> 4.12'   ← COMMENT THIS OUT or delete
end