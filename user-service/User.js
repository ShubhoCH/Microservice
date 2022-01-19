const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    password: String,
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = User = mongoose.model("User", UserSchema);