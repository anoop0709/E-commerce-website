const jwt = require('jsonwebtoken');
const User = require('../model/userschema');



module.exports = {

    checkAuth:(req,res,next) =>{
        const token = req.cookies.jwt;

        if(token){
            jwt.verify(token,process.env.jwtSecretKey,(err,decodedToken)=>{
                if(err){
                    console.log(err.message);
                    res.redirect('/login')
                }else{
                    next();
                }
            })
        }else{
            res.redirect('/login');
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