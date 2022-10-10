const User = require('../model/userschema');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware')
require('dotenv').config();
const account_SID = process.env.account_SID;
const auth_token = process.env.auth_Token;
const service_Id = process.env.service_ID;
const client = require('twilio')(account_SID,auth_token);


const handleErrors = (err)=>{

    let Error = {fname:'',email:'',password:'',phone:''};
    console.log(err.message);
    
    
    if(err.code === 11000){
        Error.email = 'This email is already registered';
        return Error;
    }
  

    if(err.message.includes('users validation failed')){
       
        Object.values(err.errors).forEach(error => {
         console.log(error.properties.path);
          Error[error.properties.path] = error.properties.message;

      }); 

    }
    console.log(Error);
    return Error;
}

const handleLoginErrors = (err)=>{
    let Error = {email:'',password:''};
    console.log(err);
    if(err.message === 'User not registered'){
        Error.email = 'Email not registered';

    }
     if(err.message === 'Your account is blocked'){
        Error.email = 'Your account is blocked';
    }
    if(err.message === 'User not verified'){
        Error.email = 'Your account is not verified';
    }
    if(err.message === 'Incorrect password'){
        Error.email = 'Incorrect password';
    }
    return Error;

}

//jason web token
let maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
   return jwt.sign({ id },process.env.jwtSecretKey,{ expiresIn:maxAge })
}



module.exports = {
    
    homePage:(req,res)=>{
       
            res.render('./user/index')
        
       
        
    },
    getsignUp:(req,res)=>{
        res.render('./user/signup')

    },
    getlogin:(req,res)=>{
        res.render('./user/login')

    },
    dosignup: async (req,res)=>{
        console.log(req.body);
        const {fname,email,password,phone} = req.body;
        console.log(fname);

        try{
            const user = await User.create({fname,email,password,phone});
            res.json({user});
        }catch(err){
            
            const errors = handleErrors(err);
             res.json({errors});
        }
    },

    sendOtp:async (req,res)=>{
        const data = req.body;
        console.log(data.phone);
       await client.verify.services(service_Id)
        .verifications
        .create({to:`+91${req.body.phone}` , channel:'sms'})
        .then(verification => console.log(verification.status))
        .catch(e => {
            console.log(e);
            res.status(500).send(e);
        });
        res.sendStatus(200);
},
    otpVerification: async (req,res)=>{
       console.log(req.body);
        const check = await client.verify.services(service_Id)
        .verificationChecks
        .create({to:`+91${req.body.phonenumber}`,code: req.body.otp})
        .catch(e => {
            console.log(e);
            res.status(500).send(e);
        });
       console.log(check.status);
      
       
       if(check.status === 'approved'){
        let email = req.body.email;
           await User.findOneAndUpdate({email:email},{isVerified:true});
    }
    res.status(200).json(check.status);
    },

    doLogin: async (req,res) => {
       
        const {email,password} = req.body;
        console.log(email,password);

        try{
            const user = await User.login(email,password);
            let token = createToken(user._id);
            res.cookie('jwt', token , {httpOnly:true, maxAge:maxAge * 1000})
            console.log(user);
            res.json({user})
        }catch(err){
            const errors =handleLoginErrors(err);
            res.json({errors})
        }
      
    },
    getlogout:(req,res)=>{
        res.cookie('jwt','',{maxAge:1})
        res.redirect('/');

    },
    userAccount:(req,res)=>{
        res.render('./user/useraccount')
    }
}