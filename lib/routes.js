var assert = require('assert')
var crud = require('./crud')
var makeMongoId = crud.makeMongoId

var configRoutes = function (app, server) {
  app.get('/', function (req, res) {
    res.redirect('/index.html')
  })

  app.all('/:dinamic/*?', function (req, res, next) {
    res.contentType('json')
    next()
  })

  app.get('/:dinamic/list', function (req, res) {
    crud.getAll(req.params.dinamic, (result_map) => res.send(result_map))
  })

  app.get('/:dinamic/read/:id', function (req, res) {
    crud.read(
      req.params.dinamic,
      { _id: makeMongoId(req.params.id)},
      {},
      (result_map) => res.send(result_map)
    )
  })

  app.post('/:dinamic/create', function (req, res) {
    crud.constructor(
      req.params.dinamic,
      req.body,
      (result) => res.send(result)
    )
  })

  app.post('/:dinamic/update/:id', function (req, res) {
    crud.update(
      req.params.dinamic,
      { _id: makeMongoId(req.params.id)},
      req.body,
      (result) => res.send(result)
    )
  })

  app.get('/:dinamic/delete/:id', function (req, res) {
    crud.destroy(
      req.params.dinamic,
      { _id: makeMongoId(req.params.id)},
      (result) => res.send(result)
    )
  })
}
module.exports = { configRoutes: configRoutes }
