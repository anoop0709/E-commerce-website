const mongoose = require('mongoose');
const { stringify } = require('urlencode');
const bcrypt = require('bcrypt');

const { isEmail } = require('validator');



const userSchema = new mongoose.Schema({

    fname:{
        type:String,
        required:[true,'please enter your  First name']
    },
    lname:{
        type:String,
        required:[true,'please enter your Last name']
    },
    email:{
        type:String,
        required:[true,'please enter your Email'],
        unique:true,
        tolowecase:true,
        validate:[isEmail,'please enter a valid email'],
    },
    password:{
        type:String,
        required:[true,'please enter a password'],
        minlength:[6,'min length is 6 character']
    },
    phone:{
        type:Number,
        required:[true,'please enter a phonenumber'],
        minlength:[10,'please enter a valid phonenumber']
    },
    address:{
        type:Array,
        required:[true,'please enter an address'] 
    },
    isBlocked:{
        type:Boolean,
        default:false
    },
    cart:{
        type:Array
    },
    whislist:{
        type:Array

    }


}) 
userSchema.pre('save',async (next)=>{
const salt = await bcrypt.genSalt();
this.password = await bcrypt.hash(this.password,salt);
    next();
})

const User = mongoose.model('users',userSchema);

module.exports = User;