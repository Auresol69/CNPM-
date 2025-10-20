const express = require('express')
const app = express()
const mongoose = require("mongoose");
const modelRoute = require("./routes/models.route")
require("dotenv").config();

const User = require("./models/user.model");
const Alert = require("./models/alert.model");
const Bus = require("./models/bus.model");
const Location = require("./models/location.model");
const Notification = require("./models/notification.model");
const Route = require("./models/route.model");
const Schedule = require("./models/schedule.model");
const Station = require("./models/station.model");
const Student = require("./models/student.model");
const Trip = require("./models/trip.model");
const AppError = require("./utils/appError");

// --- DATABASE CONNECTION ---
const { DB_URL, PORT } = process.env;
const port = PORT || 3000;
mongoose.connect(DB_URL)
    .then(() => { console.log("Database connected successfully!") })
    .catch((err) => {
        console.error("🔴 Database connection error:", err.message);
        process.exit(1); // Exit process with failure
    });

console.log("Connecting to DB URL:", DB_URL.split('@')[1]);

/**
 * @type {import('express').RequestHandler}
 */

// MIDDLEWARES
app.use(express.json()); // Body parser, for reading data from body into req.body

const models = {
    users: User,
    alerts: Alert,
    buses: Bus,
    locations: Location,
    notifications: Notification,
    routes: Route,
    schedules: Schedule,
    stations: Station,
    students: Student,
    trips: Trip
}

// Middleware to get the correct model based on the URL parameter
const getModel = (req, res, next) => {
    const modelName = req.params.models.toLowerCase();
    req.Model = models[modelName] // if modelName = users => models[modelName] = User (object)
    if (!req.Model)
        return next(new AppError(`Model '${req.params.models}' not found`, 404));
    console.log(`Request for model: ${req.Model.modelName}`);
    next();
}

app.use("/:models", getModel, modelRoute);

// Khong tim thay endpoint phu hop
// This middleware will run for any request that didn't match a route above
app.use((req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl}`, 404));
})

// MIDDLEWARE XỬ LÝ LỖI TẬP TRUNG (Global Error Handler)
app.use((err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    res.status(err.statusCode).json({
        status: err.status,
        msg: err.message
    })
})

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});