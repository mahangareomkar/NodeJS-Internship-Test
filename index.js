const express = require("express");
const cors = require("cors");
const connectdb = require("./database/db")

const app = express();
const PORT = process.env.PORT || 8080;

connectdb();

app.use(express.json());
app.use(cors());

app.get("/",(req,res)=>{
    res.send("Hello this is User Api Server");
})

app.use("/users",require("./routes/user"));

app.listen(PORT,()=>{
    console.log(`User API is running on Port ${PORT}`);
})