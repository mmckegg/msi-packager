var Xml = require('xmlbuilder')

module.exports = h

var proto = {}
Object.defineProperty(proto, 'toXml', {
  value: function (options) {
    return Xml.create(this).end(options)
  },
  writable: true,
  configurable: true,
  enumerable: false
})

function h (name, attr, children) {
  var obj = Object.create(proto)

  obj[name] = []

  if (Array.isArray(attr)) {
    children = attr
    attr = null
  }

  if (attr && Object.keys(attr).length) {
    var mappedAttributes = {}
    for (var k in attr) {
      mappedAttributes['@' + k] = attr[k]
    }
    obj[name].push(mappedAttributes)
  }


  if (children) {
    obj[name].push(children)
  }

  return obj
}