const express = require('express');
const app = express();
const userRouter = require('./route/user');
const path = require('path');
const layouts = require('express-ejs-layouts');
const {urlencoded } = require('express');
const dotenv = require('dotenv')

const mongoose  = require('mongoose');

app.use(express.static('public'));


app.set('view engine','ejs');
app.use(layouts);
app.use(express.json())
app.use(express.urlencoded({extended:true}));
dotenv.config();

//database connection
const dbUri = 'mongodb+srv://anoopsk0709:Yadhuanu87@cluster0.1ytz8lg.mongodb.net/goggles';
mongoose.connect(dbUri)
.then((result) => app.listen(3000))
.catch((err)=>console.log(err));



app.use('/',userRouter);

module.exports = app;