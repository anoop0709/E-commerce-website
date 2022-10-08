const User = require('../model/userschema');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/authMiddleware')



const handleErrors = (err)=>{

    let Error = {fname:'',lname:'',email:'',password:'',phone:''};
    //console.log(err.message,err.code);
    
    
    if(err.code === 11000){
        Error.email = 'This email is already registered';
        return Error;
    }
    if(err.message === 'user not registered'){
        Error.email = 'Email not registered';

    }
    if(err.message === 'incorrect password'){
      Error.password = 'Incorrect password';

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
            let token = createToken(user._id);
            res.cookie('jwt', token , {httpOnly:true, maxAge:maxAge * 1000})
            
            res.json({user});
            
        }catch(err){
            
            const errors = handleErrors(err);
             res.json({errors});
        }
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
            const errors =handleErrors(err);
            res.json({errors})
        }
      
    },
    getlogout:(req,res)=>{
        res.cookie('jwt','',{maxAge:1})
        res.redirect('/')

    }
}