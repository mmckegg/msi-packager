var Xml = require('xmlbuilder')

module.exports = h

var proto = {
  constructor: h
}

Object.defineProperty(proto, 'toXml', {
  value: function (options) {

    var root = Xml.create(this.name, this.attributes)
    addChildren.call(root, this.childNodes)

    function addChildren(child) {
      var parent = this
      if (Array.isArray(child)) {
        child.forEach(addChildren, parent)
      } else if (typeof child === 'string') {
        parent.text(child)
      } else if (child instanceof Object) {
        if (child.name) {
          var node = parent.element(child.name, child.attributes)
          addChildren.call(node, child.childNodes)
        }
      }
    }

    return root.toString(options)
  },
  writable: true,
  configurable: true,
  enumerable: false
})

function h (name, attr, children) {
  var obj = Object.create(proto)

  if (Array.isArray(attr) && !children) {
    children = attr
    attr = {}
  }

  obj.name = name
  obj.attributes = attr
  obj.childNodes = children
  return obj
}