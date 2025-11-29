const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    grade: {
        type: String,
        required: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    pickupStopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
    },
    dropoffStopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station'
    },
    isActive: {
        type: Boolean,
        default: true,
        select: false
    },

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
            type: [Number],
            required: true
        }
    }
}, {
    timestamps: true
}
);

studentSchema.index({ location: '2dsphere' });

module.exports = mongoose.model("Student", studentSchema); 