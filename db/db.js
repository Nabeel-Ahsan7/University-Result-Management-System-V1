const mongoose = require('mongoose');

const db = process.env.DB_URI;

function connectToDb() {
    if (!db) {
        console.error("❌ Database connection string is missing!");
        process.exit(1);
    }

    mongoose
        .connect(db)
        .then(() => console.log("✅ MongoDB Connected Successfully!"))
        .catch(err => {
            console.error("❌ MongoDB Connection Error:", err);
            process.exit(1);
        });
}

module.exports = connectToDb;