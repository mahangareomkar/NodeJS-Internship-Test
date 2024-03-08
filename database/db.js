const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const connectdb = async()=>{
    await mongoose.connect(process.env.DATABASE_URL);
}

module.exports = connectdb;