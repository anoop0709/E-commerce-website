const mongoose = require('mongoose');
const { stringify } = require('urlencode');
const bcrypt = require('bcrypt');
const { isEmail } = require('validator');



const adminSchema = new mongoose.Schema({
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
        }
    
})
adminSchema.statics.login = async function (email,password) {
    const admin = await this.findOne({email:email});
    
    if(admin){
        const auth = await bcrypt.compare(password,admin.password);
        if(auth){
           
                return admin;
        }
        throw Error('Incorrect password');
   
}
    throw Error('Admin not registered');
    
}

const Admin = mongoose.model('admin',adminSchema);

module.exports = Admin;