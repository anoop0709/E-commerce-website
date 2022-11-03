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
    isVerified:{
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


userSchema.statics.login = async function (email,password) {
    const user = await this.findOne({email:email});
    
    if(user){
        if(user.isVerified == true){
            console.log(123456);
        const auth = await bcrypt.compare(password,user.password);
        console.log(auth);
        if(auth){
            console.log(7654321)
            if(user.isBlocked == false){
                
                return user;
            }
           throw Error('Your account is blocked');
        }
        throw Error('Incorrect password');
    }
    throw Error('User not verified');
}
    throw Error('User not registered');
    
}

const User = mongoose.model('users',userSchema);

module.exports = User;