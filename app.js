const express = require('express');
const app = express();
const userRouter = require('./route/user');
const adminRouter = require('./route/admin')
const path = require('path');
const layouts = require('express-ejs-layouts');
const {urlencoded } = require('express');
require('dotenv').config();
const cookieParser = require('cookie-parser');
const noCache = require('nocache');

const mongoose  = require('mongoose');


app.use(express.static('public'));


app.set('view engine','ejs');
app.use(layouts);
app.set('layout','layout','adminlayout');
app.use(express.json())
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use(noCache());


//database connection

mongoose.connect(process.env.dbUri)
.then((result) =>{ 
    app.listen(3000);
    console.log("dbconnected");
})
.catch((err)=>console.log(err));



app.use('/',userRouter);
app.use('/',adminRouter)

module.exports = app;