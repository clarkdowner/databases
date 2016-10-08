var mySQL = require('../db');
var Promise = require('bluebird');


mySQL.connect();

var queryForUserIdAsync = function(username) {
  return new Promise((resolve, reject) => {
    mySQL.query('select id from users where username = ?', [username], (err, userId) => {
      if (err) { console.log(err); }

      if (userId.length < 1) {
        reject(err);
      } else {
        resolve(userId[0].id);
      }
    });
  });
};

var queryForRoomIdAsync = function(roomname, cb) {
  return new Promise((resolve, reject) => {
    mySQL.query('select id from rooms where roomname = ?', [roomname], (err, roomId) => {
      if (err) { console.log(err); }

      if (roomId.length < 1) {
        reject(err);
      } else {
        resolve(roomId[0].id);
      }
    });
  });
};

var findUserId = function(username) {
  return new Promise((resolve, reject) => {
    queryForUserIdAsync(username)
      .then((userId) => resolve(userId))
      .catch(() => {
        module.exports.users.post(username, () => {
          queryForUserIdAsync(username)
            .then((userId) => resolve(userId))
            .catch((err) => reject(err));
        });
      });
  });
};

var findRoomId = function(roomname) {
  return new Promise((resolve, reject) => {
    queryForRoomIdAsync(roomname)
      .then((roomId) => resolve(roomId))
      .catch(() => {
        module.exports.rooms.post(roomname, () => {
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
      mySQL.query('select message from messages', (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    }, // a function which produces all the messages
    post: function (msg, cb) {
      findUserId(msg.username)
        .then((userId) => {
          findRoomId(msg.roomname)
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
    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function (username, cb) {
      // return a user from the db.
      mySQL.query('select messages.message from messages inner join users on messages.user_id = users.id where users.username = ?;', [username], (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    },
    post: function (username, cb) {
      queryForUserIdAsync(username)
        .then(() => {
          console.log('user already exists');
          cb();
        })
        .catch(() => {
          mySQL.query('insert into users (username) values (?)', [username], (err) => {
            if (err) { throw err; }
            cb();
          });
        });
      // add a new user to the db.
    }
  },

  rooms: {
    // Ditto as above.
    get: function (roomname, cb) {
      // return a user from the db.
      mySQL.query('select messages.message from messages inner join rooms on messages.room_id = rooms.id where rooms.roomname = ?', [roomname], (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    },
    post: function (roomname, cb) {
      console.log('inside rooms put method', roomname);
      // add a new room to the db.
      mySQL.query('insert into rooms (roomname) values (?)', [roomname], (err) => {
        if (err) { throw err; }
        cb();
      });
    }
  }
};

