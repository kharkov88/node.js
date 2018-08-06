var chatObj, emitUserList, singIn
var socket = require('socket.io')
var crud = require('./crud')

var makeMongoId = crud.makeMongoId
var chatterMap = {}

// --------start closes methods-----------
emitUserList = function (io) {
  crud.read(
    'user',
    {is_online: true},
    {},
    function (result_list) {
      io.sockets.emit('listchange', result_list)
    }
  )
}

singIn = function (io, user_map, socket) {
  crud.update(
    'user',
    {'_id': user_map._id},
    {is_online: true},
    (result_map) => {
      emitUserList(io)
      user_map.is_online = true
      socket.emit('userupdate', user_map)
    }
  )
  chatterMap[user_map] = socket
  socket.user_id = user_map._id
}
// --------end closes methods-------------
chatObj = {
  connect: function (server) {
    var io = socket.listen(server)
    io
      // .set('blacklist', [])
      // .of('/chat')
      .on('connection', function (socket) {
        socket.on('adduser', (user_map) => {
          crud.read(
            'user',
            {name: user_map.name},
            {},
            (result_list) => {
              console.log('result_list: ', result_list)
              var result_map = {}
              var cid = user_map.cid
              delete user_map.cid
              if (result_list.length > 0) {
                result_map = result_list[0]
                result_map.cid = cid
                singIn(io, result_map, socket)
              } else {
                user_map.is_online = true
                crud.construct(
                  'user',
                  user_map,
                  (result) => {
                    console.log('result_new:', result.ops[0])
                    result_map = result.ops[0]
                    console.log('result_new:', result_map)
                    result_map.cid = cid
                    chatterMap[result_map._id] = socket
                    socket.user_id = result_map._id
                    socket.emit('userupdate', result_map)
                    emitUserList(io)
                  }
                )
              }
              console.log('------ch_map------', chatterMap)
              console.log('------------------end------------')
            }
          )
        })
        socket.on('updatechat', () => {})
        socket.on('leavechat', () => {})
        socket.on('disconnect', () => {})
        socket.on('updateavatar', () => {})
      })
    return io
  }
}

module.exports = chatObj
