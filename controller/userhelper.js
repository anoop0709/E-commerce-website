const User = require('../model/userschema');
const Product = require('../model/productschema');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/userauthMiddleware')
require('dotenv').config();
const account_SID = process.env.account_SID;
const auth_token = process.env.auth_Token;
const service_Id = process.env.service_ID;
const client = require('twilio')(account_SID,auth_token);
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../model/userschema');
const Order = require('../model/orderschema');
const Razorpay = require('razorpay');
var instance = new Razorpay({ key_id: 'rzp_test_8rQGV8fr9QRNn8', key_secret: '0iA8p66fFN3Du3Pzl01fcg00' })
var crypto = require('crypto');
const humandate = require('human-date');
const jsPDF = require('jspdf');


function generateRazorpay(orderId,total,userid) {
    console.log(orderId,total);
    return new Promise((resolve,reject)=>{
        var options = {
           amount: total*100,  
           currency: "INR",  
           receipt: ""+orderId
        };
        console.log(options.amount);
        console.log(typeof(options.amount));
        
        instance.orders.create(options,function(err,order){

            resolve(order)
            console.log(order)

            
        });
          
          
    })
}




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
       
            res.render('./user/index',{layout:"layout"})
        
    },
    getsignUp:(req,res)=>{
        res.render('./user/signup',{layout:"layout"})

    },
    getlogin:(req,res)=>{
        res.render('./user/login',{layout:"layout"})

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

    signinwith_otp: async (req,res)=>{

        console.log(req.body);
        const check = await client.verify.services(service_Id)
        .verificationChecks
        .create({to:`+91${req.body.phonenumber}`,code: req.body.otp})
        .catch(e => {
            console.log(e);
            res.status(500).send(e);
        });
       console.log(check.status);
      let status = check.status;
       if(status === 'approved'){
        let email = req.body.email;
        
         try{
            const user = await User.findOne({email:email});
            let token = createToken(user._id);
            res.cookie('jwt', token , {httpOnly:true, maxAge:maxAge * 1000});
            console.log(user);
            res.json({user,status});
        }catch(err){
            const errors = handleLoginErrors(err);
            res.json({errors})
        }
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
            const errors =handleLoginErrors(err);
            res.json({errors})
        }
      
    },
    getlogout:(req,res)=>{
        res.cookie('jwt','',{maxAge:1})
        res.redirect('/');

    },
    userAccount:async (req,res)=>{
        const userId = req.params.id;
        let addressLength = 0;
        
       // console.log(userId);
        const user = await User.findOne({_id:userId});
        user.address.map((el)=>{
            addressLength++;

        });
        console.log(addressLength);
      
        //console.log(user.address);
        res.render('./user/useraccount',{layout:"layout",user,addressLength});
    },
    reset_password:(req,res)=>{
        res.render('./user/passwordreset',{layout:'layout'});

    },
    reset_password_post:async (req,res)=>{
        //let userid = req.params.id;
        let {oldpassword,newpassword,userid}= req.body;

        console.log(oldpassword,newpassword,userid);

        let user = await User.findOne({_id:userid});
        console.log(user);
        if(user){
            try{
                let userpassword = await bcrypt.compare(oldpassword,user.password);
                if(userpassword){
                    console.log(userpassword);
                    const salt = await bcrypt.genSalt();
                     let Newpassword = await bcrypt.hash(newpassword,salt);
                    console.log(Newpassword);
                  let user =   await User.updateOne({_id:userid},{password:Newpassword})
                  console.log(user);
                    res.json({user});
                }else{
                    res.json({message:'password entered wrong'})
                    console.log('password entered wrong');
                }
            }catch(err){
                console.log(err);
            }
           
        }
       

    },
    edit_profile:(req,res)=>{
        res.render('./user/usereditprofile',{layout:'layout'})
    },
    edit_profile_post:async (req,res)=>{
        let userId = req.params.id;
        let name = req.body.fname;
        let email = req.body.email;
        let phone = req.body.phone;
        let address = {
            unique: uuidv4(),
            housename:req.body.housename,
            street:req.body.streetname,
            city:req.body.city,
            state:req.body.state,
            pincode:req.body.pincode
        }

        console.log(userId,name,email,phone,address);
        try{
            let user = await User.findOneAndUpdate({_id:userId},{$set:{fname:name,email:email,phone:phone,address:address}});
            res.redirect('/useraccount/'+ userId);
        }catch(err){
            console.log(err);
        }
    },
    add_address:async (req,res)=>{
        res.render('./user/addaddress',{layout:'layout'})
    },
    add_address_post:async (req,res)=>{
        console.log(req.body);
        let userId = req.params.id;
        console.log(uuidv4());
        let address = {
            unique: uuidv4(),
            housename:req.body.housename,
            street:req.body.streetname,
            city:req.body.city,
            state:req.body.state,
            pincode:req.body.pincode

        }
        let user = await User.findOneAndUpdate({_id:userId},{$push:{address:address}});
        res.redirect('/useraccount/'+ userId);
    },
    delete_address:async (req,res)=>{
        let userid = req.params.id;
        let addressid = req.params.address;

        await User.findByIdAndUpdate({_id:userid},{$pull:{address:{unique:addressid}}})
        res.redirect('/useraccount/'+ userid);

    },
    edit_address:async (req,res)=>{
        let userId = req.params.id;
        const addressid = req.params.address;
        let matchingaddress = await User.find({_id:userId},{address:{$elemMatch:{unique:{$eq:addressid}}}});
        let addressarr = matchingaddress[0];
        let address = addressarr.address[0]
        res.render('./user/editaddress',{layout:'layout',address,userId})

    },
    edit_address_post:async (req,res)=>{
        let userid = req.params.id;
        let addressid = req.params.address;
        let address = req.body;
        let housename = req.body.housename;
        let street = req.body.streetname;
        let city = req.body.city;
        let state = req.body.state;
        let pincode = req.body.pincode;
        console.log(address);
        let matchingaddress = await User.find({_id:userid},{address:{$elemMatch:{unique:{$eq:addressid}}}});
        let addressarr = matchingaddress[0];
        let addressfind = addressarr.address[0]
        let addressupdate = await User.findOneAndUpdate({address:{$elemMatch:{unique:{$eq:addressid}}}},{'$set':{'address.$.housename':housename,'address.$.street':street,'address.$.city':city,'address.$.state':state,'address.$.pincode':pincode}});
        res.redirect('/useraccount/'+ userid);
    },

    get_shop_page:async (req,res)=>{
       
        let products = await Product.find({});
       
       
        res.render('./user/shop',{layout:'layout',products})

    },
    single_view:async (req,res)=>{
        let productid = req.params.id;
        let productdetails = await Product.findOne({_id:productid});
        let Allproducts = await Product.find({}).lean();
        // console.log(productdetails);
        
        res.render('./user/singlepageview',{layout:'layout',productdetails,Allproducts})
    },

    cart_page:async (req,res)=>{
        let userid = req.params.id;
        let user = await User.findOne({_id:userid});
        let cartlength = 0;
        let total = 0;
        let cartqty = user.cart.map((el)=>{
            cartlength++;
            return el;
        });

        let totalprice = user.cart.map((el)=>{
            return el.price;   
        })
        if(totalprice.length >= 1){
        total = totalprice.reduce((acc,curr)=>{
            return acc+curr;
        })
    }
        res.render('./user/cart',{layout:'layout',cartqty,cartlength,total})
    },
    add_to_cart:async (req,res)=>{
        let productid = req.body.productid;
        let qty = req.body.qtyinp;
        let price = req.body.price
        let userid = req.body.userid;
        let product = await Product.findOne({_id:productid});

        let cartproduct = {
            qty :qty ,
            product: product,
            price:qty*price
         }
       
        let user = await User.findOne({_id:userid});
        let proExist = user.cart.filter((el) => {
            return el.product === product._id;
        })
        if(proExist.length >= 1){
         let cartqty = user.cart.map((el) => {
             if (el.product == productid) {
                 console.log("found");
                 el.qty++;
             }
             return el
         })

         await User.findByIdAndUpdate({_id:userid},{$set:{cart:cartqty}});

        user.cart = newcRT

        }else{
            user.cart.push(cartproduct);
        }
       
        await user.save();
       res.json({user});
    },

    qty_increment: async (req,res)=>{
         let userid = req.body.userid;
        let qty = req.body.qty;
        let price = req.body.price;
        let count = req.body.count;
        let productid = req.body.productid;
        let total = 0;
       
        let user = await User.findOne({_id:userid});
         let newcart = user.cart.map((el) => {
             if (el.product._id == productid) {
                 console.log("found");
                 if(count == 1){
                     el.qty = qty;
                    el.price = price*qty;
                    console.log(el.qty,el.price);

                 }else{
                     el.qty = qty;
                     el.price = price*qty;
                 }
                }
             return el
         })

        
         let cartitems = {};
         for(let i = 0; i<newcart.length;i++){
             if(newcart[i].product._id == productid){
                 cartitems.price = newcart[i].price;
                 cartitems.qty = newcart[i].qty;
                 
             }

         }
         
         let totalprice = user.cart.map((el)=>{
             return el.price;
          
           
            
         })
         console.log(totalprice);
        if(totalprice.length >= 1){
          total = totalprice.reduce((acc,curr)=>{
             return acc+curr;
         })
        }
         console.log(total);

      await User.findByIdAndUpdate({_id:userid},{$set:{cart:newcart}});
      user.cart = newcart;
      await user.save();

        //let updatedcartproduct = user.cart
         //res.redirect('/cart/'+ userid)
         res.json({cartitems,total});
    
   
    },
    delete_cart_product:async (req,res)=>{
        let productid = req.params.id;
        let userid = req.params.userid
        let user = await User.findOne({_id:userid});
        let cartproduct = {};
        user.cart.forEach((el)=>{
            if(el.product._id == productid){
                 cartproduct = el;
            }
        })
   await User.updateOne({_id:userid},{$pull:{cart:cartproduct}});
   res.redirect('/cart/'+ userid)
   console.log(cartproduct);
    },

    placeorder:async (req,res)=>{
        let userid = req.params.id;
        let user = await User.findOne({_id:userid});
        let length = 0;
        let total = 0;
        
       let cartproduct =  user.cart.map((el)=>{
                return el;
            
        })
       let address =  user.address.map((el)=>{
            return el;
        })
        let totalprice = user.cart.map((el)=>{
            return el.price;
         
          
           
        })
        console.log(totalprice);
       if(totalprice.length >= 1){
         total = totalprice.reduce((acc,curr)=>{
            return acc+curr;
        })
       }
        console.log(cartproduct);
        console.log(address);
    
        res.render('./user/placeorder',{layout:'layout',cartproduct,address,length,total})

    },
    addTo_wishlist:async (req,res)=>{
        let productid = req.body.proid;
        let qty = req.body.qtyinp;
        let price = req.body.price
        let userid = req.body.userid;
        let product = await Product.findOne({_id:productid});
        let user = await User.findOne({_id:userid}); 
        let count = 0;
console.log(price);
        let wishelement = user.whislist.map((el)=>{
            return el;
        })
        wishelement.forEach((el)=>{
            if(el.product._id == productid){
                count = 1;
            }
        })

        if(count == 0){
            let wishproduct = {
                qty :qty ,
                product: product,
                price:qty*price
             }
            user.whislist.push(wishproduct);
            await user.save();
             res.json({user});
        }else{
            res.json("alreadyexists");
        }

       
    
       

    },
    get_wishlist: async (req,res)=>{
        let userid = req.params.id;
        let user = await User.findOne({_id:userid});
        let wishlength = 0;
        // let total = 0;
        let wishlist = user.whislist.map((el)=>{
            wishlength++;
            return el;
        });

    //     let totalprice = user.cart.map((el)=>{
    //         return el.price;   
    //     })
    //     if(totalprice.length >= 1){
    //     total = totalprice.reduce((acc,curr)=>{
    //         return acc+curr;
    //     })
    // }
        res.render('./user/wishlist',{layout:'layout',wishlist,wishlength})
    },
    wishlist_to_cart:async (req,res)=>{
        let productid = req.body.productid;
        let qty = req.body.qtyinp;
        let price = req.body.price
        let userid = req.body.userid;
        let product = await Product.findOne({_id:productid});

        let cartproduct = {
            qty :qty ,
            product: product,
            price:qty*price
         }
       
        let user = await User.findOne({_id:userid});
        let proExist = user.cart.filter((el) => {
            return el.product === product._id;
        })
        if(proExist.length >= 1){
         let cartqty = user.cart.map((el) => {
             if (el.product == productid) {
                 console.log("found");
                 el.qty++;
             }
             return el
         })

         await User.findByIdAndUpdate({_id:userid},{$set:{cart:cartqty}});

        // user.cart = newcRT

        }else{
            user.cart.push(cartproduct);
        }

        let wishlistproduct = {};
        user.cart.forEach((el)=>{
            if(el.product._id == productid){
                 wishlistproduct = el;
            }
        })
   await User.updateOne({_id:userid},{$pull:{whislist:wishlistproduct}});
       
        await user.save();
       res.json({user});

    },
    delete_wish_product:async (req,res)=>{
        let productid = req.params.id;
        let userid = req.params.userid
        let user = await User.findOne({_id:userid});
        let wishlistproduct = {};
        user.whislist.forEach((el)=>{
            if(el.product._id == productid){
                 wishlistproduct = el;
            }
        })
   await User.updateOne({_id:userid},{$pull:{whislist:wishlistproduct}});
   res.redirect('/wishlist/'+ userid);
},

place_order: async (req,res)=>{
    let userid = req.body.userid;
    console.log(req.body.address);
   let total = req.body.total;
    console.log(req.body);
    let user = await User.findOne({_id:userid})
    let cartitems = user.cart.map((el)=>{
        return el;
    })
    let status = req.body.paymentmethod == 'cod' ? 'placed':'pending'
let orders = {
            fname: req.body.fname,
            phone:req.body.phone,
            address: req.body.address,
            paymentmethod:req.body.paymentmethod,
            total:total,
            status:status
        }
 
 console.log(orders);
 await Order.create({products:cartitems,order:orders,user:userid}).then(async (orderDetails)=>{
    
     if(req.body.paymentmethod == 'cod'){
         res.json({success:true,data: orderDetails});
         let usercart = await  User.updateOne({_id:userid},{$set:{cart:[]}},{multi:true});
         console.log(usercart);
     }
     if(req.body.paymentmethod == 'card'){
      generateRazorpay(objectId(orderDetails._id),total,userid).then((response)=>{
          res.json(response)
          console.log(response);
        })
    }
    
 });
 
 
    

    
},
order_confirmation:(req,res)=>{
    let orderid = req.params.orderid;
    console.log(orderid);
    res.render('./user/orderconfirmation',{layout:'layout',orderid})
},
verifyPayment:(details)=>{
    return new Promise((resolve,reject)=>{
       console.log(details);
        let hmac = crypto.createHmac('sha256', '0iA8p66fFN3Du3Pzl01fcg00').update(details.payment.razorpay_order_id+ '|' + details.payment.razorpay_payment_id).digest('hex');
       if(hmac === details.payment.razorpay_signature){
           resolve();
           console.log("inside hmac");
       }else{
           reject();
       }

    })
},
changepaymentstatus: (orderId,userId)=>{
    console.log(orderId);
    return new Promise(async (resolve,reject)=>{
       await Order.findByIdAndUpdate({_id:orderId},
        {
            $set:{
               "order.status":'placed'
            }
        }
        
        ).then(async ()=>{
            resolve()
            let usercart = await  User.updateOne({_id:userId},{$set:{cart:[]}},{multi:true});
    console.log(usercart);
        }).catch((err)=>{
            console.log(err);
        })
 

    })
},
view_order:async (req,res)=>{
    let userid = req.params.userid
    let order = await Order.find({user:userid});
   let date =  humandate.prettyPrint(order.orderDate);
   console.log(date);
    

console.log(order);

    res.render('./user/vieworder',{layout:'layout',order,date})
},

// invoice_download:async (req,res)=>{

//     let orderid = req.params.orderid;



// }

}