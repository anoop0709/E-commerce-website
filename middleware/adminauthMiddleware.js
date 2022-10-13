const jwt = require('jsonwebtoken');
const Admin = require('../model/adminSchema');
require('dotenv').config();



module.exports = {

    checkAuthadmin:(req,res,next) =>{
        const token = req.cookies.admin;
        console.log(token+"hai token");

        if(token){
            jwt.verify(token,process.env.jwtSecretKey,(err,decodedToken)=>{
                if(err){
                    console.log(err.message);
                    //res.redirect('/admin')
                   next()
                   
                }else{
                    console.log(token);
                   res.redirect('/adminhome')
                   //next();
                  
                    
                }   
            })
        }else{
          //res.redirect('/admin')
          next()
          
           
          
        }


    },

    checkAdmin:(req,res,next) =>{
        const token = req.cookies.admin;

        if(token){
            jwt.verify(token,process.env.jwtSecretKey,async (err,decodedToken)=>{
                if(err){
                    console.log(err.message);
                    res.locals.admin = null;
                   res.redirect('/admin')
                
                }else{
                    let admin = await Admin.findById(decodedToken.id);
                    res.locals.admin = admin;
                    console.log(admin+"hai admin");
                    next();
                }
            })
        }else{
            res.locals.admin = null;
            res.redirect('/admin');
        }
    }
}