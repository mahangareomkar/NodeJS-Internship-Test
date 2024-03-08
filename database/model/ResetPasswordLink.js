const mongoose = require("mongoose");

const ResetPasswordLinkSchema = new mongoose.Schema({
    userID: String,
    createdAt:{
        type:Date,
        default:Date.now()
    }
});

module.exports = mongoose.model("ResetPasswordLink",ResetPasswordLinkSchema);