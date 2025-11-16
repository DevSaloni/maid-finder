const express = require('express');
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

//routes 
const maidRoute = require("./routes/maidRoutes");
const jobRoute =require("./routes/JobRoute");
const userRoute = require("./routes/userRoutes");
const contactRoute = require("./routes/contactRoute");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

//mongo db connect
mongoose.connect(process.env.MONGO_URL).then(() =>{
    console.log("mongodb connected successfully");
}).catch(err=>{
    console.log("mongodb connected error",err);

})

app.use("/api/maids",maidRoute);
app.use("/api/jobs", jobRoute);
app.use("/api/users",userRoute);
app.use("/api/contact", contactRoute);


const PORT = process.env.PORT;

app.listen(PORT , ()=>{
    console.log("server started at:", PORT);
});



