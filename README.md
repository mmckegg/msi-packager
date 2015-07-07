msi-packager
===

Build MSI (Windows Installer) packages on Mac and Linux.

The installer has no wizard. Users just run the installer and your app will be installed and shortcuts created.

## Requirements

You must have `wixl` from [`msitools`](https://wiki.gnome.org/msitools) available in your path.

### Mac

```bash
$ brew install msitools
```

### Linux

```bash
# ubuntu / debian
$ sudo apt-get install msitools
```

## Install [via npm](https://www.npmjs.com/package/msi-packager)

```bash
$ npm install msi-packager
```

## Node Example

```js
var createMsi = require('./')

var options = {

  // required
  source: '/Users/matt/Code/loop/loopjs-packager/build/Loop Drop-win32',
  output: '/Users/matt/Code/loop/loopjs-packager/releases/Loop Drop v1.0.0.msi',
  name: 'Loop Drop',
  upgradeCode: 'YOUR-GUID-HERE',
  version: '1.0.0',
  manufacturer: 'loopjs.com',
  iconPath: '/Users/matt/Code/loop/loopjs-packager/icon.ico',
  executablePath: 'Loop Drop.exe',

  // optional
  description: "Some description",
  localInstall: true

}

createMsi(options, function (err) {
  if (err) throw err
  console.log('Outputed to ' + options.output)
})
```

## Local User vs Machine Install

By default the app will be installed for all users under **Program Files**.

If you specify `localUser: true` as an option, the app will be installed to the user's AppData folder. This allows non-admin users to install your app. 

## CLI

Not yet implemented :( 

**Pull requests accepted!**