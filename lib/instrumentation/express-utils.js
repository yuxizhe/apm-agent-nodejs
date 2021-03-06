'use strict'

var symbols = require('../symbols')
var parsers = require('../parsers')

var parseUrl
try {
  parseUrl = require('parseurl')
} catch (e) {
  parseUrl = req => parsers.parseUrl(req.url)
}

function normalizeSlash (value) {
  return value[0] === '/' ? value : '/' + value
}

function excludeRoot (value) {
  return value !== '/'
}

function join (parts) {
  if (!parts) return
  return parts.filter(excludeRoot).map(normalizeSlash).join('') || '/'
}

// This works for both express AND restify
function routePath (route) {
  if (!route) return
  return route.path || (route.regexp && route.regexp.source)
}

function getStackPath (req) {
  var stack = req[symbols.expressMountStack]
  return join(stack)
}

// This function is also able to extract the path from a Restify request as
// it's storing the route name on req.route.path as well
function getPathFromRequest (req, useBase, usePathAsTransactionName) {
  if (req[symbols.staticFile]) {
    return 'static file'
  }

  var path = getStackPath(req)
  var route = routePath(req.route)

  if (route) {
    return path ? join([path, route]) : route
  } else if (path && (path !== '/' || useBase)) {
    return path
  }

  if (usePathAsTransactionName) {
    const parsed = parseUrl(req)
    return parsed && parsed.pathname
  }
}

module.exports = {
  getPathFromRequest,
  getStackPath,
  routePath
}
