var mySQL = require('../db');
var Promise = require('bluebird');


mySQL.connect();


// var queryForUserId = (username, cb) => {
//   mySQL.query('select distinct id from users where username = ?', [username], (err, userId) => {
//     module.exports.users.get(username, (err, username) => {
//       if (err) {
//         module.exports.users.post(username, () => cb(userId[0].id));
//       } else {
//         cb(userId[0].id);
//       }
//     });  
//   });
// };

// var queryForRoomId = function(roomname, cb) {
//   console.log('============================20==================');
//   console.log('inside the room query', roomname);
//   mySQL.query('select id from rooms where roomname = ?', [roomname], (err, roomId) => {
//     module.exports.rooms.get(roomname, (err, results) => {
//       if (err) {
//         module.exports.rooms.post(roomname, () => cb(roomId[0].id));
//       } else {
//         cb(roomId[0].id);
//       }
//     });  
//   });
// };

var queryForUserId = function(username) {
  //return new Promise

  mySQL.query('select id from users where username = ?', [username], (err, userId) => {
    if (err) { console.log(err); }

    cb(err, userId[0].id);
  });
};

var queryForUserIdAsync = Promise.promisify(queryForUserId);


var queryForRoomId = function(roomname, cb) {
  mySQL.query('select id from rooms where roomname = ?', [roomname], (err, roomId) => {
    if (err) { console.log(err); } else {

      console.log('!!!!!!!!!!!!!!!!!!!!!!!', roomId);
      cb(err, roomId[0].id);
    }
  });
};

var queryForRoomIdAsync = Promise.promisify(queryForRoomId);

var checkUser = function(username) {
  return new Promise((resolve, reject) => {
    queryForUserIdAsync(username)
      .then((userId) => resolve(userId))
      .catch(() => {
        module.exports.user.post(username, () => {
          queryForUserIdAsync(username)
            .then((userId) => resolve(userId))
            .catch((err) => reject(err));
        });
      });
  });
};

var checkRoom = function(roomname) {
  return new Promise((resolve, reject) => {
    queryForRoomIdAsync(roomname)
      .then((roomId) => resolve(roomId))
      .catch(() => {
        module.exports.room.post(roomname, () => {
          queryForRoomIdAsync(roomname)
            .then((roomId) => resolve(roomId))
            .catch((err) => reject(err));
        });
      });
  });
};

module.exports = {
  messages: {
    get: function (cb) {
      // return all msgs from the db.
      // console.log('============================36==================');
      mySQL.query('select message from messages', (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    }, // a function which produces all the messages
    post: function (msg, cb) {
      checkUser(msg.username)
        .then((userId) => {
          checkRoom(msg.roomname)
            .then((roomId) => {
              mySQL.query('insert into messages (message, user_id, room_id) values (?, ?, ?);', [msg.message, userId, roomId], (err) => {
                if (err) { throw err; }
                console.log('message saved');
                cb();
              });
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => console.log(err));



      // queryForUserId(msg.username, (userId) => {
      //   queryForRoomId(msg.roomname, (roomId) => {
      //     console.log('============================47==================');
      //     console.log('text', msg.message, 'user', userId, 'room', roomId);
      //     mySQL.query('insert into messages (message, user_id, room_id) values (?, ?, ?);', [msg.message, userId, roomId], (err) => {
      //       if (err) { throw err; }
      //       console.log('message saved');
      //       cb();
      //     });
      //   });
      // });

    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function (username, cb) {
      // return a user from the db.
      // console.log('============================62==================');
      mySQL.query('select messages.message from messages inner join users on messages.user_id = users.id where users.username = ?;', [username], (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    },
    post: function (username, cb) {
      // add a new user to the db.
      // console.log('============================71==================');
      mySQL.query('insert into users (username) values (?)', [username], (err) => {
        if (err) { throw err; }
        cb();
      });
    }
  },

  rooms: {
    // Ditto as above.
    get: function (roomname, cb) {
      // return a user from the db.
      // console.log('============================83==================');
      mySQL.query('select messages.message from messages inner join rooms on messages.room_id = rooms.id where rooms.roomname = ?', [roomname], (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    },
    post: function (roomname, cb) {
      console.log('inside rooms put method', roomname);
      // add a new room to the db.
      // console.log('============================92==================');
      mySQL.query('insert into rooms (roomname) values (?)', [roomname], (err) => {
        if (err) { throw err; }
        cb();
      });
    }
  }
};

