const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContentSchema = new Schema({
    title: String,
    story: String,
    contentID: String,
    userID: String,
    interaction: {
        type: Number,
        default: 0,
    },
    created_at: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = Content = mongoose.model("Content", ContentSchema);