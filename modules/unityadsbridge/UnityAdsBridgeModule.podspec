Pod::Spec.new do |s|
  s.name           = 'UnityAdsBridge'
  s.version        = '1.0.0'
  s.summary        = 'Bridge for Unity Ads in Expo'
  s.homepage       = 'https://dripn.app'
  s.author         = ''
  s.source_files   = '**/*.{h,m,swift}'
  s.platforms      = { :ios => '13.0' }
  s.dependency 'ExpoModulesCore'
  s.dependency 'UnityAds'
end