var mySQL = require('../db');

mySQL.connect();


var queryForUserId = (username, cb) => {
  console.log('============================7==================');
  mySQL.query('select distinct id from users where username = ?', [username], (err, userId) => {
    console.log('in the user query function', userId)[0];
    module.exports.users.get(username, (err, username) => {
      if (err) {
        module.exports.users.post(username, () => cb(userId));
      } else {
        cb(userId);
      }
    });  
  });
};

var queryForRoomId = function(roomname, cb) {
  console.log('============================20==================');
  mySQL.query('select id from rooms where roomname = ?', [roomname], (err, roomId) => {
    module.exports.rooms.get(roomname, (err, roomname) => {
      if (err) {
        module.exports.rooms.post(roomname, () => cb(roomId));
      } else {
        cb(roomId);
      }
    });  
  });
};

module.exports = {
  messages: {
    get: function (cb) {
      // return all msgs from the db.
      console.log('============================36==================');
      mySQL.query('select message from messages', (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    }, // a function which produces all the messages
    post: function (msg, cb) {
      // console.log(msg, '=============================!!!!!!');
      queryForUserId(msg.username, (userId) => {
        queryForRoomId(msg.roomname, (roomId) => {
          console.log('============================47==================');
          console.log('text', msg.message, 'user', userId, 'room', roomId);
          mySQL.query('insert into messages (message, user_id, room_id) values (?, ?, ?);', [msg.message, userId, roomId], (err) => {
            if (err) { throw err; }
            console.log('message saved');
            cb();
          });
        });
      });

    } // a function which can be used to insert a message into the database
  },

  users: {
    // Ditto as above.
    get: function (username, cb) {
      // return a user from the db.
      console.log('============================62==================');
      mySQL.query('select messages.message from messages inner join users on messages.user_id = users.id where users.username = ?;', [username], (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    },
    post: function (username, cb) {
      // add a new user to the db.
      console.log('============================71==================');
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
      console.log('============================83==================');
      mySQL.query('select messages.message from messages inner join rooms on messages.room_id = rooms.id where rooms.roomname = ?', [roomname], (err, result) => {
        if (err) { throw err; }

        cb(result);
      });
    },
    post: function (roomname, cb) {
      // add a new room to the db.
      console.log('============================92==================');
      mySQL.query('insert into rooms (roomname) values (?)', [roomname], (err) => {
        if (err) { throw err; }
        cb();
      });
    }
  }
};

