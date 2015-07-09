var generateXml = require('./generate-xml')
var execFile = require('child_process').execFile
var temp = require("temp").track()
var fs = require('fs')

module.exports = function(options, cb) {
  // options: 
  //  source
  //  output
  //  name
  //  upgradeCode
  //  version
  //  manufacturer
  //  arch
  //  iconPath
  //  executable
  //  localInstall

  writeXml(options, function (err, path) {
    var args = [path, '-o', options.output]

    if (options.arch) {
      args.push('--arch', options.arch)
    }

    execFile('wixl', args, cb)
  })
}

function writeXml(options, cb) {
  temp.open('msi-packager', function(err, info) {
    generateXml(options, function(err, xml) {
      fs.write(info.fd, xml)
      fs.close(info.fd, function (err) {
        if (err) return cb(err)
        cb(null, info.path)
      })
    })
  })
}
