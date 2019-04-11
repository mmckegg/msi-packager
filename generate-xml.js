var fs = require('fs')
var map = require('async-each')
var join = require('path').join
var el = require('./lib/hyperxml')

module.exports = generateXml

function generateXml(options, cb) {
  getComponents('.', options, function(err, components, ids) {
    if (err) return cb(err)

    var optionsWithIds = Object.create(options)
    optionsWithIds.componentIds = ids

    cb(null, installerFor(components, optionsWithIds).toXml({pretty: true}))
  })
}

function installerFor (components, options) {
  return el('Wix', {
    xmlns: 'http://schemas.microsoft.com/wix/2006/wi'
  }, [

    el('Product', {
      Id: '*',
      Name: options.name,
      UpgradeCode: options.upgradeCode,
      Language: '1033',
      Codepage: '1252',
      Version: options.version,
      Manufacturer: options.manufacturer
    }, [

      el('Property', {
        Id: 'NEWERVERSIONDETECTED',
        Secure: 'yes'
      }),

      el('Upgrade', {
        Id: options.upgradeCode
      }, [
        el('UpgradeVersion', {
          Minimum: options.version,
          Property: "NEWERVERSIONDETECTED",
          OnlyDetect: "yes",
          
        }),
        el('UpgradeVersion', {
          Minimum: '0.0.0',
          Maximum: options.version,
          Property: "OLDERVERSIONBEINGUPGRADED",
          IncludeMinimum: "yes",
          IncludeMaximum: "no"
        })
      ]),
      el('Condition', {
        Message: "A newer version of this software is already installed."
      }, ["NOT NEWERVERSIONDETECTED"]),

      options.runAfter ? el('Property', {
	Id: "cmd",
	Value: "cmd.exe"
      }) : "",

      options.runAfter ? el('CustomAction', {
	  Id: "LaunchApplication",
	  ExeCommand: "/c start \"\" \"%programfiles%\\"+options.name+"\\"+options.executable+"\"",
	  Execute: "",
	  Property: "cmd",
	  Impersonate: "yes"
      }) : "",

      el('InstallExecuteSequence', [
        el('RemoveExistingProducts', {
          Before: "InstallInitialize" 
        }),
	options.runAfter ? el('Custom', {
	  Action: 'LaunchApplication',
	  After: 'InstallFinalize'
	}, ["NOT Installed"]) : ""
      ]),

      el('CustomAction', {
	Id: "LaunchInstalledExe",
	FileKey: "mainExecutableFile", // what goes here?
	ExeCommand: "",                // and here?
	Execute: "immediate",
	Impersonate: "yes",
	Return: "asyncNoWait"
      }),

      el('Package', {
        InstallerVersion: "200",
        Compressed: "yes",
        Comments: "Windows Installer Package",
        InstallScope: options.localInstall ? "perUser" : "perMachine"
      }),

      el('Media', {
        Id: '1',
        Cabinet: 'app.cab',
        EmbedCab: 'yes'
      }),

      el('Icon', {
        Id: "icon.ico",
        SourceFile: options.iconPath
      }),

      el('Property', {
        Id: 'ARPPRODUCTICON',
        Value: 'icon.ico'
      }),

      el('Directory', {
        Id: 'TARGETDIR', 
        Name: 'SourceDir'
      }, [
        el('Directory', {
          Id: getProgramsFolder(options), 
        }, [
          el('Directory', {
            Id: 'INSTALLDIR',
            Name: options.name,
          }, components)
        ])
      ]),

      el('Feature', {
        Id: 'App',
        Level: '1'
      }, options.componentIds.map(function(id) {
        return el('ComponentRef', { Id: id })
      }))

    ])
  ])
}

function getComponents (path, options, cb) {
  var fullPath = join(options.source, path)
  var ids = []

  fs.readdir(fullPath, function (err, entries) {
    if (err) return cb(err)
    entries = entries.filter(function(entry) {
      return entry !== '.DS_Store'
    })
    map(entries, function (entry, next) {
      var subPath = join(path, entry)
      fs.stat(join(fullPath, entry), function(err, stats) {
        if (err) return next(err)
        if (stats.isDirectory()) {
          getComponents(subPath, options, function(err, components, subIds) {
            if (err) return next(err)
            ids.push.apply(ids, subIds)
            next(null, el('Directory', {
              Id: escapeId(subPath),
              Name: entry
            }, components))
          })
        } else {
          var id = escapeId(subPath)
          ids.push(id)

          var items = [
            el('File', {
              Id: id,
              Source: join(fullPath, entry),
              Name: entry 
            })
          ]

          if (subPath === options.executable) {
            items.push(el('Shortcut', {
              Id: 'StartMenuShortcut',
              Advertise: 'yes',
              Icon: 'icon.ico',
              Name: options.name,
              Directory: 'ProgramMenuFolder',
              WorkingDirectory: 'INSTALLDIR',
              Description: options.description || ''
            }), el('Shortcut', {
              Id: 'DesktopShortcut',
              Advertise: 'yes',
              Icon: 'icon.ico',
              Name: options.name,
              Directory: 'DesktopFolder',
              WorkingDirectory: 'INSTALLDIR',
              Description: options.description || ''
            }))
          }

          next(null, el('Component', {
            Id: id,
            Guid: '*'
          }, items))
        }
      })
    }, function (err, components) {
      if (err) return cb(err)
      cb(null, components, ids)
    })
  })
}

function getProgramsFolder (options) {
  if (options.localInstall) {
    return 'LocalAppDataFolder'
  } else {
    if (options.arch === 'x64') {
      return 'ProgramFiles64Folder'
    } else {
      return 'ProgramFilesFolder'
    }
  }
}

function escapeId (id) {
  return encodeURIComponent(id)
}
