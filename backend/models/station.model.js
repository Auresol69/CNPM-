const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    district: String,
    fullAddress: {
        type: String,
        required: true
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
            required: true
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true
        }
    }
}, { _id: false });

const stationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    address: {
        type: addressSchema,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false
    },
});

stationSchema.index({ 'address.location': '2dsphere' });

module.exports = mongoose.model("Station", stationSchema);