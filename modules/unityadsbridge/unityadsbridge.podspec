Pod::Spec.new do |s|
  s.name           = 'unityadsbridge'   ← Change this line to lowercase module name
  s.version        = '1.0.0'
  s.summary        = 'Expo native bridge for Unity Ads'
  s.homepage       = 'https://dripn.app'
  s.author         = ''
  s.source_files   = 'src/**/*.{h,m,swift}'
  s.platforms      = { :ios => '13.0' }
  s.dependency 'ExpoModulesCore'
  s.dependency 'UnityAds', '~> 4.12'
end