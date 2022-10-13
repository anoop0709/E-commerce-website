const Admin = require('../model/adminSchema');
const User = require('../model/userschema');
const Product = require('../model/productschema')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');

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
    view_users:async (req,res)=>{
        let users = await User.find({}).lean();
        console.log(users);
        res.render('./admin/users',{users,layout:'adminlayout'});

    },
    block_user: async (req,res)=>{
        let userId = req.params.id;
        console.log(userId);
        let user = await User.findByIdAndUpdate({_id:userId},{isBlocked:true})
        res.redirect('/userlist')
    },
    unblock_user: async (req,res)=>{
        let userId = req.params.id;
        console.log(userId);
        let user = await User.findByIdAndUpdate({_id:userId},{isBlocked:false})
        res.redirect('/userlist')
    },
    get_product_page:(req,res)=>{
        res.render('./admin/addproduct',{layout:'adminlayout'})
    },

    add_product:async (req,res)=>{
       // let products = req.body;
        console.log(req.body);
        const productname = req.body.productname;
        const productdescription = req.body.productdescription;
        const brand = req.body.productbrand;
        const price = req.body.price;
        const qty = req.body.qty;
        const productcategory = {
            shape:req.body.shape,
            frametype:req.body.frametype,
            color:req.body.color,
            gender:req.body.gender
        }
        console.log(productname,productdescription,brand,price,qty,productcategory);
       let product =  await Product.create({productname,productdescription,brand,price,qty,productcategory})
       try{
        let image = req.files.image;
        image.mv('./public/image/'+product._id +".jpeg");
         res.redirect('/addproduct')
       }catch(err){
           console.log(err);
       }
      
    },
    edit_product:async (req,res)=>{
        let proId = req.params.id;
        let product = await Product.findOne({_id: proId});
        console.log(product);
        res.render('./admin/editproduct',{product,layout:'adminlayout'})
    },
    update_product: async(req,res)=>{
        let proid = req.params.id;
        const productname = req.body.productname;
        const productdescription = req.body.productdescription;
        const brand = req.body.productbrand;
        const price = req.body.price;
        const qty = req.body.qty;
        const productcategory = {
            shape:req.body.shape,
            frametype:req.body.frametype,
            color:req.body.color,
            gender:req.body.gender
        }
        console.log(proid);
        let product = await Product.findOneAndUpdate({_id:proid},{productname,productdescription,brand,price,qty,productcategory})
        res.redirect('/productlist');
        
    },
    delete_product:async (req,res)=>{

    let proid = req.params.id;
   let deletedproduct =  await Product.findByIdAndDelete({_id:proid});
    res.redirect('/productlist');
    fs.unlink("./public/image/" + proid +".jpeg",(err)=>{
        console.log(err);
    })



    }


}