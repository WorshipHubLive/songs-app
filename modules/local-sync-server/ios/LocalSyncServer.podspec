Pod::Spec.new do |s|
  s.name           = 'LocalSyncServer'
  s.version        = '1.0.0'
  s.summary        = 'Tiny mDNS-advertised HTTP server for Songs <-> Songs Local Sync'
  s.description    = 'Lets the desktop Songs app discover and push directly to this device over LAN, same protocol as another desktop instance.'
  s.author         = ''
  s.homepage       = 'https://docs.expo.dev/modules/'
  s.platforms      = {
    :ios => '16.4',
    :tvos => '16.4'
  }
  s.source         = { git: '' }
  s.static_framework = true

  s.dependency 'ExpoModulesCore'

  # Swift/Objective-C compatibility
  s.pod_target_xcconfig = {
    'DEFINES_MODULE' => 'YES',
  }

  s.source_files = "**/*.{h,m,mm,swift,hpp,cpp}"
end
