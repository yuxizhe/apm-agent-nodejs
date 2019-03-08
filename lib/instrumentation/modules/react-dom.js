'use strict'

var shimmer = require('../shimmer')

module.exports = function (reactDomServer, agent, version, enabled) {
  if (!enabled) return reactDomServer
  shimmer.wrap(reactDomServer, 'renderToString', wrapCompile)

  return reactDomServer

  function wrapCompile (original) {
    return function wrappedCompile (input) {
      var span = agent.startSpan('react SSR render', 'react')
      var id = span && span.transaction.id

      agent.logger.debug('intercepted call to react renderToString %o', {
        id: id,
        input: input
      })

      var ret = original.apply(this, arguments)
      if (span) span.end()

      return wrapTemplate(ret)
    }
  }
}
