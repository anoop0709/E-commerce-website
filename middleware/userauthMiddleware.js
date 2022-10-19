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
        let cartlength = 0;

        if(token){
            jwt.verify(token,process.env.jwtSecretKey,async (err,decodedToken)=>{
                if(err){
                    console.log(err.message);
                    res.locals.user = null;
                   next();
        
                }else{
                    let user = await User.findById(decodedToken.id);
                    user.cart.forEach((el)=>{
                        cartlength++;

                    })
                    res.locals.user = user;
                    res.locals.cartlength = cartlength;

                    next();
                }
            })
        }else{
            res.locals.user = null;
            next();
        
        }
    }
}