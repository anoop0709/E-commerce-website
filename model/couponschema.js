const mongoose = require('mongoose');


const couponSchema = new mongoose.Schema({
    coupon:{
        type:String,
        required:true
    },
    couponValue:{
        type:Number,
        required:true
    },
    userid:{
        type:Array
        
    },
    maxAmount:{
        type:Number,
        required:true
    },
    minAmount:{
        type:Number,
        required:true
    }
})

const Coupon = mongoose.model('coupon',couponSchema);

module.exports = Coupon;