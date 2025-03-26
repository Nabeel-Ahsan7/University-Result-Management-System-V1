const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Semester name is required'],
        unique: true,
        trim: true
    }
}, {
    timestamps: true
});

const Semester = mongoose.model('Semester', semesterSchema);

module.exports = Semester;