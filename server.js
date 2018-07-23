var
  http = require('http'),
  express = require('express'),
  routes = require('./lib/routes'),
  app = express(),
  server = http.createServer(app)

app.configure(function () {
  app.use(express.bodyParser())
  app.use(express.methodOverride())
  // app.use(express.basicAuth('user', 'spa'))
  app.use(app.router)
  app.use(express.static(__dirname + '/public'))
})
app.configure('development', function () {
  app.use(express.logger())
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }))
})
app.configure('production', function () {
  app.use(express.errorHandler())
})

routes.configRoutes(app, server)
server.listen(3000)
console.log('i open on %s', server.address().port, app.settings.env)
