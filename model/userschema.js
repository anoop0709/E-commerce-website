const mongoose = require('mongoose');
const { stringify } = require('urlencode');
const bcrypt = require('bcrypt');

const { isEmail } = require('validator');



const userSchema = new mongoose.Schema({

    fname:{
        type:String,
        required:[true,'please enter your  First name']
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
userSchema.pre('save',async function (next){
const salt = await bcrypt.genSalt();
this.password = await bcrypt.hash(this.password,salt);
    next();
})

userSchema.statics.login = async function (email,password) {
    const user = await this.findOne({email});
    if(user){
        const auth = await bcrypt.compare(password,user.password);
        if(auth){
            return user;
        }
        throw Error('incorrect password');
    }
    throw Error('user not registered');
    
}

const User = mongoose.model('users',userSchema);

module.exports = User;