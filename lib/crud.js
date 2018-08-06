var
  loadSchema, checkSchema, clearIsOnline, checkType, constructObj,
  readObj, updateObj, destroyObj, makeMongoId, validator, objTypeMap
var assert = require('assert')
var mongodb = require('mongodb')
var MongoClient = mongodb.MongoClient
var JSV = require('JSV').JSV
var fsHandle = require('fs')

const url = 'mongodb://localhost:27017'
const dbName = 'spa'
var db = null

validator = JSV.createEnvironment()
objTypeMap = { 'user': {} }
// -------------------end variable---------------------

// -----------------start closes methods----------------------

loadSchema = function (schema_name, schema_path) {
  fsHandle.readFile(schema_path, 'utf8', function (err, data) {
    objTypeMap[schema_name] = JSON.parse(data)
  })
}

checkSchema = function (obj_type, obj_map, callback) {
  var schema_map = objTypeMap[obj_type]
  var report_map = validator.validate(obj_map, schema_map)

  callback(report_map.errors)
}

clearIsOnline = function () {
  updateObj(
    'user',
    {is_online: true},
    {is_online: false},
    (res_map) => console.log('All users set to offline', res_map))
}
// -----------------end closes methods-----------------

// -----------------start public methods----------------
checkType = function (obj_type) {
  if (!objTypeMap[obj_type]) {
    return ({
      error_msg: 'Object type ' + obj_type + ' is not supported.'
    })
  }
  return null
}
constructObj = function (obj_type, obj_map, callback) {
  var type_check_map = checkType(obj_type)
  if (type_check_map) {
    callback(type_check_map)
    return
  }
  checkSchema(obj_type, obj_map, function (error_list) {
    if (error_list.length === 0) {
      const collection = db.collection(obj_type)
      collection.insertMany([obj_map], function (err, result) {
        callback(result)
      })
    } else {
      callback({
        error_msg: 'Doc not valid',
        error_list: error_list
      })
    }
  })
}

readAll = function (obj_type, callback) {
  const collection = db.collection(obj_type)
  collection.find().toArray(function (err, map) {
    callback(map)
  })
}

readObj = function (obj_type, find_map, fields_map, callback) {
  var type_check_map = checkType(obj_type)
  if (type_check_map) {
    callback(type_check_map)
    return
  }
  var collection = db.collection(obj_type)
  collection.find(find_map, fields_map).toArray(
    function (err, result_map) {
      callback(result_map)
    })
}

updateObj = function (obj_type, find_map, set_map, callback) {
  var type_check_map = checkType(obj_type)
  if (type_check_map) {
    callback(type_check_map)
    return
  }
  checkSchema(obj_type, set_map, function (error_list) {
    if (error_list.length === 0) {
      var collection = db.collection(obj_type, function (err, collection) {
        var
          sort_order = [],
          opt_map = {
            'new': true,
            upsert: false,
            safe: true
          }
        collection.findAndModify(
          find_map,
          sort_order,
          set_map,
          opt_map,
          function (err, update_map) {
            callback(update_map)
          })
      })
    } else {
      callback({
        error_msg: 'Doc not valid',
        error_list: error_list
      })
    }
  })
}

destroyObj = function (obj_type, find_map, callback) {
  var type_check_map = checkType(obj_type)
  if (type_check_map) {
    callback(type_check_map)
    return
  }
  const collection = db.collection(obj_type)
  collection.findOne(find_map)
    .then((result) => collection.deleteOne(result, (err, result_map) => callback(result_map)))
}

module.exports = {
  makeMongoId: mongodb.ObjectId,
  checkType: checkType,
  construct: constructObj,
  getAll: readAll,
  read: readObj,
  update: updateObj,
  destroy: destroyObj
}

// -----------------------end public methods-----------------------

MongoClient.connect(url, function (err, client) {
  assert.equal(null, err)
  console.log('Connected successfully to server')
  db = client.db(dbName)
});

(function () {
  var schema_name, schema_path
  for (schema_name in objTypeMap) {
    if (objTypeMap.hasOwnProperty(schema_name)) {
      schema_path = __dirname + '/' + schema_name + '.json'
      loadSchema(schema_name, schema_path)
    }
  }
}())
