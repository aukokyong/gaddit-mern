//handle all controller to /attendees
const express = require("express");
const Rooms = require("../models/RoomsSchema");
const Users = require("../models/UsersSchema");
const Qna = require("../models/QnASchema");
const router = express.Router();

let attendeeID = "";

const isAuthenticated = (req, res, next) => {
  console.log("session data:", req.session.currentUser);
  if (req.session.currentUser) {
    attendeeID = req.session.currentUser._id;
    next();
  } else {
    console.log("no session");
    res.status(401).send("You are currently not logged in. Please log in");
  }
};

//Get upcoming rooms that are public and not hosted by this attendee
router.get("/upcoming", isAuthenticated, (req, res) => {
  Rooms.find(
    {
      $and: [
        { eventStart: { $gte: new Date() } },
        { isPublic: true },
        { hostID: { $ne: attendeeID } },
      ],
    },
    (err, rooms) => {
      if (err) {
        res.status(500).send("Database error. Pls contact your system admin");
      } else {
        res.status(200).send(rooms);
      }
    }
  );
});

//Get past attended room
router.get("/past", isAuthenticated, (req, res) => {
  Users.findById(attendeeID, (err, user) => {
    if (err) {
      res.status(500).send("Database error. Pls contact your system admin");
    } else {
      const attendedRoom = user.roomAttendedHistory;
      console.log(attendedRoom);
      if (attendedRoom.length === 0) {
        return res.status(200).send(attendedRoom);
      }
      let data = [];
      attendedRoom.map((roomID, index) => {
        Rooms.findById(roomID, (err, room) => {
          console.log(roomID);
          if (err) {
            res
              .status(500)
              .send("Database error. Pls contact your system admin");
          }
          Qna.find({ roomID: room._id }, (err, qna) => {
            if (err) {
              res
                .status(500)
                .send("Database error. Pls contact your system admin");
            } else {
              if (qna.length === 0) {
                data.push(room);
                if (index === attendedRoom.length - 1) {
                  return res.status(200).send(data);
                }
              } else {
                data.push({ ...room, questions: qna });
                if (index === attendedRoom.length - 1) {
                  return res.status(200).send(data);
                }
              }
            }
          });
        });
      });
    }
  });
});

//to check credentials for private event + update roomAttendedHistory on user profile + store roomInfo on the session
router.post("/private", isAuthenticated, (req, res) => {
  Rooms.findById(req.body.roomID, (err, room) => {
    if (err) {
      res
        .status(500)
        .send("Database error. Pls contact your system admin for rooms");
    } else if (!room) {
      res
        .status(401)
        .send("No room found. Please ensure you key in the correct room ID");
    } else {
      if (
        req.body.roomCode === room.roomCode &&
        req.body.roomPassword === room.roomPassword
      ) {
        req.session.currentRoom = room;
        Users.findByIdAndUpdate(
          attendeeID,
          { $addToSet: { roomAttendedHistory: req.body.roomID } },
          (err, user) => {
            if (err) {
              console.log("error on updating user profile");
              res
                .status(500)
                .send(
                  "Database error. Pls contact your system admin for users"
                );
            }
            res.status(200).send("successfully join");
          }
        );
      } else {
        res
          .status(401)
          .send("Please ensure the room code and room password is correct");
      }
    }
  });
});

//to check credentials for public event + update roomAttendedHistory on user profile + store roomInfo on the session
router.post("/:roomID", isAuthenticated, (req, res) => {
  Rooms.findById(req.params.roomID, (err, room) => {
    if (err) {
      res.status(500).send("Database error. Pls contact your system admin");
    } else {
      if (
        req.body.roomCode === room.roomCode &&
        req.body.roomPassword === room.roomPassword
      ) {
        req.session.currentRoom = room;
        Users.findByIdAndUpdate(
          attendeeID,
          { $addToSet: { roomAttendedHistory: req.params.roomID } },
          (err, user) => {
            if (err) {
              res
                .status(500)
                .send("Database error. Pls contact your system admin");
            } else {
              res.status(200).send("successfully join");
            }
          }
        );
      } else {
        res
          .status(401)
          .send("Please ensure the room code and room password is correct");
      }
    }
  });
});

module.exports = router;
