const Admin = require('../model/adminSchema');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//signup error handling
const handleErrors = (err)=>{

    let Error = {fname:'',email:'',password:''};
    console.log(err.message);
    
    
    if(err.code === 11000){
        Error.email = 'This email is already registered';
        return Error;
    }
  

    if(err.message.includes('admin validation failed')){
       
        Object.values(err.errors).forEach(error => {
         console.log(error.properties.path);
          Error[error.properties.path] = error.properties.message;

      }); 

    }
    console.log(Error);
    return Error;
}

//admin cookie token 

let maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
   return jwt.sign({ id },process.env.jwtSecretKey,{ expiresIn:maxAge })
}

const handleLoginErrors = (err)=>{
    let Error = {email:'',password:''};
    console.log(err);
    if(err.message === 'Admin not registered'){
        Error.email = 'Email not registered';

    }
    if(err.message === 'Incorrect password'){
        Error.email = 'Incorrect password';
    }
    return Error;

}


module.exports = {
    admin_getlogin:(req,res)=>{
        res.render('./admin/adminlogin',{layout:"adminlayout"})
    },
    admin_dologin:async (req,res)=>{
        console.log(req.body);
        const {email,password} = req.body;
        try{
            let admin = await Admin.login(email,password);
            let adminToken = createToken(admin.id);
            res.cookie('admin', adminToken , {httpOnly:true, maxAge:maxAge * 1000})
            console.log(admin);
            res.json({admin})
        }catch(err){
            const errors =handleLoginErrors(err);
            res.json({errors})
        
        }
        

    },
    admin_home:(req,res)=>{
        res.render('./admin/adminhome',{layout:"adminlayout"})
    },
    add_admin:(req,res)=>{
        res.render('./admin/addadmin',{layout:"adminlayout"})

    },
    admin_signup: async (req,res)=>{
        console.log(req.body);
        const {fname,email,password} = req.body;
        console.log(fname);
       

        try{
            const admin = await Admin.create({fname,email,password});
            res.json({admin});
        }catch(err){
            
            const errors = handleErrors(err);
             res.json({errors});
        }
    },

    admin_logout:(req,res)=>{
        res.cookie('admin','',{maxAge:1})
        res.redirect('/admin');

    },

}