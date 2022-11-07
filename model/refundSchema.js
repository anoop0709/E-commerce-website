const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema



const refundSchema = new mongoose.Schema({
    fname:{
        type:String,
        required:true

    },
    email:{
        type:String,
        required:true
    },

    user:{
        type:String,
        required:true
    },
    refundAmount:{
        type:Number,
        required:true
    },
    orderid:{
        type:String,
       required:true
    },
    reason:{
        type:String,
        required:true

    },
    refundDate:{
        type:Date,
        default:Date.now()
       
    },
    transactionid:{
        type:String,
        required:true
    }

})
const Refund = mongoose.model('refund',refundSchema);

module.exports = Refund;