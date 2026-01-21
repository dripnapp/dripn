Pod::Spec.new do |s|
  s.name             = 'unityadsbridge'
  s.version          = '1.0.0'
  s.summary          = 'Expo native bridge for Unity Ads'
  s.homepage         = 'https://dripn.app'
  s.author           = ''
  s.source           = { :path => '.' }  # Local files (required)
  s.source_files     = 'src/**/*.{h,m,swift}'
  s.platforms        = { :ios => '13.0' }
  s.license          = { :type => 'MIT', :file => 'LICENSE' }  # Minimal MIT license
  s.dependency 'ExpoModulesCore'
  s.dependency 'UnityAds', '~> 4.12'
end