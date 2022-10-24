const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema

const orderSchema = new mongoose.Schema({
    orderDate:{
        type:Date,
        default:Date.now()
       
    },
    products:{
        type:Array,
        required:true
    },
    order:{
        type:Object,
        required:true
       
    }


})
const Order = mongoose.model('order',orderSchema);

module.exports = Order;