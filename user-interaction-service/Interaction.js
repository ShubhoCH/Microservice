const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InteractSchema = new Schema({
    contentID: String,
    title: String,
    story: String,
    read: Number,
    like: Number,
    total: Number,
});

module.exports = Interaction = mongoose.model("Interaction", InteractSchema);