const express = require('express');
const app = express();
const userRouter = require('./route/user');
const path = require('path');
const layouts = require('express-ejs-layouts');
const {urlencoded } = require('express');
const dotenv = require('dotenv').config();

const mongoose  = require('mongoose');

app.use(express.static('public'));


app.set('view engine','ejs');
app.use(layouts);
app.use(express.json())
app.use(express.urlencoded({extended:true}));


//database connection

mongoose.connect(process.env.dbUri)
.then((result) =>{ 
    app.listen(3000);
    console.log("dbconnected");
})
.catch((err)=>console.log(err));



app.use('/',userRouter);

module.exports = app;