const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema

const orderSchema = new mongoose.Schema({
    date:{
        type:Date,
        required:true
    },
    products:{
        type:Array,
        required:true
    },
    user:{
        type:ObjectId,
        ref:"users"
    }


})