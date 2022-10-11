const jwt = require('jsonwebtoken');
const User = require('../model/userschema');
require('dotenv').config();



module.exports = {

    checkAuth:(req,res,next) =>{
        const token = req.cookies.jwt;

        if(token){
            jwt.verify(token,process.env.jwtSecretKey,(err,decodedToken)=>{
                if(err){
                    console.log(err.message);
                    next();
                }else{
                    res.redirect('/');
                    
                }   
            })
        }else{
           next();
        }


    },

    checkUser:(req,res,next) =>{
        const token = req.cookies.jwt;

        if(token){
            jwt.verify(token,process.env.jwtSecretKey,async (err,decodedToken)=>{
                if(err){
                    console.log(err.message);
                    res.locals.user = null;
                   next();
        
                }else{
                    let user = await User.findById(decodedToken.id);
                    res.locals.user = user;
                    next();
                }
            })
        }else{
            res.locals.user = null;
            next();
        
        }
    }
}