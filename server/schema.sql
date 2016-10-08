CREATE DATABASE chat;

USE chat;


CREATE TABLE rooms (
  /* Describe your table here.*/
  id int primary key AUTO_INCREMENT,
  roomname varchar(255)
);

CREATE TABLE users (
  /* Describe your table here.*/
  id int primary key AUTO_INCREMENT,
  username varchar(255)
);

CREATE TABLE messages (
  /* Describe your table here.*/
  id int primary key AUTO_INCREMENT,
  message varchar(255),
  user_id int,
  room_id int,
  FOREIGN KEY(user_id) REFERENCES users(id),
  FOREIGN KEY(room_id) REFERENCES rooms(id)
);


/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/

