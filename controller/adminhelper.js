const Admin = require('../model/adminSchema');
const User = require('../model/userschema');
const Product = require('../model/productschema');
const Order = require('../model/orderschema');
const Coupon = require('../model/couponschema')
const jwt = require('jsonwebtoken');
require('dotenv').config();
const fs = require('fs');
const humandate = require('human-date');
const { REFUSED } = require('dns');


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
    admin_home: async (req,res)=>{
        let userCount = 0;
        let totalRevenue = 0;
        let totalOrder = 0;
        const user  = await User.find({});
        const product = await Order.find({})
        user.forEach((el)=>{
            userCount++;

        })
        product.forEach((el)=>{
            totalOrder++;
            let total = parseInt(el.order.total);
            totalRevenue = totalRevenue + total;
        })

        res.render('./admin/adminhome',{layout:"adminlayout",userCount,totalRevenue,totalOrder})
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
        const isfeatured = req.body.isfeatured
        const productcategory = {
            shape:req.body.shape,
            frametype:req.body.frametype,
            color:req.body.color,
            gender:req.body.gender
        }
        console.log(req.body.frametype);
        console.log(productname,productdescription,brand,price,qty,isfeatured,productcategory);
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



    },
    order_history: async (req,res)=>{
        let limit = 10;
        //let skip = page*9;
        let page = req.query.page >= 1 ? req.query.page : 1;
        page = page-1;
        const order = await Order.find().sort({"orderDate":-1}).limit(10).skip(page*limit);;
        console.log(order);
        let date =  order.map((order)=>{
            return order.orderDate.toLocaleString();
        })
        console.log(date);
        res.render('./admin/orderhistory',{order,layout:'adminlayout',date})
    },
    order_status_change:async (req,res)=>{
        const orderid = req.params.id;
        const orderstatus = req.body.orderStatus;
        console.log(req.body.orderStatus+"hai");
        console.log(orderid+"hello");

        let orderstatuschange = await Order.findByIdAndUpdate({_id:orderid},{$set:{"order.status":orderstatus}});
        res.redirect('/orderhistory');
    },

    sort_order:async (req,res)=>{
        console.log(req.body);
        const datefrom = req.body.datefrom;
        const dateto = req.body.dateto;
        let brand = req.body.brand;
        let orderStatus = req.body.orderStatus;

        const data = await Order.find();
        let date =  data.map((data)=>{
            return data.orderDate.toLocaleString();
        })
       let order =  data.filter((el)=>{ 
            if(el.order.status == orderStatus || orderStatus == 'all'){
                return el;
            }
          

           
        });
        res.render('./admin/orderhistory',{order,layout:'adminlayout',date});
      
        

       

    },
    coupon_page:(req,res)=>{
        res.render('./admin/addcoupon',{layout:'adminlayout'})
    },
    add_coupon:async (req,res)=>{

        const coupon = req.body.coupon;
        const value = req.body.couponValue;
        const maxvalue = req.body.maxValue;
        const minvalue = req.body.minValue;
        console.log(req.body);
        const couponcode = await Coupon.create({coupon:coupon,couponValue:value,maxAmount:maxvalue,minAmount:minvalue});
        res.redirect('/coupon')

    },
    get_all_coupon:async (req,res)=>{

        const couponcode = await Coupon.find({});
        console.log(couponcode);
        res.render('./admin/couponpage',{layout:'adminlayout',couponcode})
    },
    update_coupon: async(req,res)=>{
        let couponid = req.params.id;
        const coupon = req.body.coupon;
        const value = req.body.couponValue;
        const maxvalue = req.body.maxValue;
        const minvalue = req.body.minValue;
        let couponcode =  await Coupon.findOneAndUpdate({_id:couponid},{coupon:coupon,couponValue:value,maxAmount:maxvalue,minAmount:minvalue})
        res.redirect('/coupon');
        
    },
    edit_coupon:async (req,res)=>{
        let couponid = req.params.id;
        let coupon = await Coupon.findOne({_id:couponid});
        console.log(coupon);
        res.render('./admin/editcoupon',{coupon,layout:'adminlayout'});
    },
    delete_coupon:async (req,res)=>{

        let couponid = req.params.id;
       let deletedcoupon =  await Coupon.findByIdAndDelete({_id:couponid});
        res.redirect('/coupon');
        },
    search_coupon:async (req,res)=>{
            const code = req.body.couponcode;
            const coupons = await Coupon.find({});
            let couponcode = [];
                  couponcode  = coupons.filter((el)=>{
                if(el.coupon == code){
                    return el;
                }

            })
            console.log(couponcode+"hello coupon");
            res.render('./admin/couponpage',{layout:'adminlayout',couponcode});
        }

}