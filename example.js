var createMsi = require('./')

var options = {
  name: 'Loop Drop',
  upgradeCode: 'YOUR-GUID-HERE',
  version: '1.0.0',
  manufacturer: 'loopjs.com',
  source: '/Users/matt/Code/loop/loopjs-packager/build/Loop Drop-win32',
  output: '/Users/matt/Code/loop/loopjs-packager/releases/Loop Drop v1.0.0.msi',
  iconPath: '/Users/matt/Code/loop/loopjs-packager/icon.ico',
  executable: 'Loop Drop.exe',
  localInstall: true
}

createMsi(options, function (err) {
  if (err) throw err
  console.log('Outputed to ' + options.output)
})