
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const Reservation = require("../models/Reservation");
const User = require("../models/User");

// Get reservations
const getAllReservations = async (req, res, next) => {
  let reservations;
  try {
    reservations = await Reservation.find();
  } catch (err) {
    const error = new Error(
      'Fetching reservations failed, please try again later.',
      500
    );
    return next(error);
  }
  res.json({reservations: reservations.map(reservation => reservation.toObject({ getters: true }))});
};


// Create reservation
const createReservation = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new Error("Invalid inputs passed, please check your data.", 422)
    );
  }

  const {  start, title,userId } = req.body;
  const createdReservations = new Reservation({
    startDate:start,
    title,
    creator: userId
  });

  console.log(req.body)

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    const error = new Error(
      "Creating reservation failed, please try again 1",
      500
    );
    return next(error);
  }

  if (!user) {
    const error = new Error("Could not find user for provided id", 404);
    return next(error);
  }

  console.log(user);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await createdReservations.save({ session: sess });
    user.reservations.push(createdReservations);
    await user.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error(
      "Creating reservation failed, please try again. 2",
      500
    );
    return next(error);
  }
  res.status(201).json({ reservation: createdReservations });
};

// DELETE reservation
const deleteReservation = async (req, res, next) => {
    const reservationId = req.params.pid;
    let reservation;
    
    try {
      reservation = await Reservation.findById(reservationId).populate("creator");
    } catch (err) {
      const error = new Error(
        "Something went wrong, could not delete reservation 111.",
        500
      );
      return next(error);
    }
  
    if (!reservation) {
      const error = new Error("Could not find reservation for this id.", 404);
      return next(error);
    }

      if (reservation.creator.id !== req.userData.userId) {
    console.log("userid: " + req.userData.userId)
    const error = new Error("You are not allowed to delete this reservation", 401);
    return next(error);
  }
  
  try {
    let sess;
    sess = await mongoose.startSession(); // assign the session to sess
    sess.startTransaction();
    await reservation.deleteOne({ session: sess });
    reservation.creator.reservations.pull(reservation);
    await reservation.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new Error(
      "Something went wrong, could not delete reservation33.",
      500
    );
    return next(error);
  }
  
    res.status(200).json({ message: "Deleted reservation.", userId:reservation.creator });
  };

exports.getAllReservations = getAllReservations;
exports.createReservation = createReservation;
exports.deleteReservation = deleteReservation;



