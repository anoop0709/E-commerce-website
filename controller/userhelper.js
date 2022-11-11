const User = require('../model/userschema');
const Product = require('../model/productschema');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/userauthMiddleware')
require('dotenv').config();
const account_SID = process.env.account_SID;
const auth_token = process.env.auth_Token;
const service_Id = process.env.service_ID;
const client = require('twilio')(account_SID, auth_token);
const objectId = require('mongodb').ObjectId;
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../model/userschema');
const Order = require('../model/orderschema');
const Razorpay = require('razorpay');
const instance = new Razorpay({ key_id: 'rzp_test_8rQGV8fr9QRNn8', key_secret: '0iA8p66fFN3Du3Pzl01fcg00' })
const crypto = require('crypto');
const humandate = require('human-date');
const Coupon = require('../model/couponschema');
const Refund = require('../model/refundSchema');


function generateRazorpay(orderId, total, userid) {
    console.log(orderId, total);
    return new Promise((resolve, reject) => {
        const options = {
            amount: total * 100,
            currency: "INR",
            receipt: "" + orderId
        };
        console.log(options.amount);
        console.log(typeof (options.amount));

        instance.orders.create(options, function (err, order) {

            resolve(order)
            console.log(order)


        });


    })
}




const handleErrors = (err) => {

    let Error = { fname: '', email: '', password: '', phone: '' };
    console.log(err.message);


    if (err.code === 11000) {
        Error.email = 'This email is already registered';
        return Error;
    }


    if (err.message.includes('users validation failed')) {

        Object.values(err.errors).forEach(error => {
            console.log(error.properties.path);
            Error[error.properties.path] = error.properties.message;

        });

    }
    console.log(Error);
    return Error;
}

const handleLoginErrors = (err) => {
    let Error = { email: '', password: '' };
    console.log(err);
    if (err.message === 'User not registered') {
        Error.email = 'Email not registered';

    }
    if (err.message === 'Your account is blocked') {
        Error.email = 'Your account is blocked';
    }
    if (err.message === 'User not verified') {
        Error.email = 'Your account is not verified';
    }
    if (err.message === 'Incorrect password') {
        Error.email = 'Incorrect password';
    }
    return Error;

}

//jason web token
const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
    return jwt.sign({ id }, process.env.jwtSecretKey, { expiresIn: maxAge })
}



module.exports = {

    homePage:async (req, res) => {
let products = await Product.find({});
        res.render('./user/index', { layout: "layout",products })

    },
    getsignUp: (req, res) => {
        res.render('./user/signup', { layout: "layout" })

    },
    getlogin: (req, res) => {
        res.render('./user/login', { layout: "layout" })

    },
    dosignup: async (req, res) => {
        console.log(req.body);
        const { fname, email, newpassword, phone } = req.body;
        console.log(fname);
       
        let password = await bcrypt.hash(newpassword,10);

        try {
            
            const user = await User.create({ fname, email, password, phone });
            res.json({ user });
        } catch (err) {

            const errors = handleErrors(err);
            res.json({ errors });
        }
    },

    sendOtp: async (req, res) => {
        const data = req.body;
        console.log(data.phone);
        await client.verify.services(service_Id)
            .verifications
            .create({ to: `+91${req.body.phone}`, channel: 'sms' })
            .then(verification => console.log(verification.status))
            .catch(e => {
                console.log(e);
                res.status(500).send(e)
            });
        res.sendStatus(200);
    },
    otpVerification: async (req, res) => {
        console.log(req.body);
        const check = await client.verify.services(service_Id)
            .verificationChecks
            .create({ to: `+91${req.body.phonenumber}`, code: req.body.otp })
            .catch(e => {
                console.log(e);
                res.status(500).send(e);
            });
        console.log(check.status);


        if (check.status === 'approved') {
            const email = req.body.email;
            await User.findOneAndUpdate({ email: email }, { isVerified: true });
        }
        res.status(200).json(check.status);
    },

    signinwith_otp: async (req, res) => {

        console.log(req.body);
        const check = await client.verify.services(service_Id)
            .verificationChecks
            .create({ to: `+91${req.body.phonenumber}`, code: req.body.otp })
            .catch(e => {
                console.log(e);
                res.status(500).send(e);
            });
        console.log(check.status);
        let status = check.status;
        if (status === 'approved') {
            const email = req.body.email;

            try {
                const user = await User.findOne({ email: email });
                let token = createToken(user._id);
                res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }).json({ user, status });
                console.log(user);
                
            } catch (err) {
                const errors = handleLoginErrors(err);
                res.json({ errors })
            }
        }
    },

    doLogin: async (req, res) => {

        
        const email = req.body.email;
        const password = req.body.password
        console.log(email, password);

        try {
            const user = await User.login(email, password);
            let token = createToken(user._id);
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 }).json({ user })
            console.log(user);
           
        } catch (err) {
            const errors = handleLoginErrors(err);
            res.json({ errors })
        }

    },
    getlogout: (req, res) => {
        res.cookie('jwt', '', { maxAge: 1 }).redirect('/');
        

    },
    userAccount: async (req, res) => {
        const userId = req.params.id;
        let addressLength = 0;

        // console.log(userId);
        const user = await User.findOne({ _id: userId });
        user.address.map((el) => {
            addressLength++;

        });
        console.log(addressLength);

        //console.log(user.address);
        res.render('./user/useraccount', { layout: "layout", user, addressLength });
    },
    reset_password: (req, res) => {
        res.render('./user/passwordreset', { layout: 'layout' });

    },
    reset_password_post: async (req, res) => {
        //let userid = req.params.id;
       
        const oldpassword = req.body.oldpassword;
        const newpassword = req.body.newpassword;
        const userid = req.body.userid;

        console.log(oldpassword, newpassword, userid);

        let user = await User.findOne({ _id: userid });
        console.log(user);
        if (user) {
            try {
                let userpassword = await bcrypt.compare(oldpassword, user.password);
                if (userpassword) {
                    console.log(userpassword);
                   
                    let Newpassword = await bcrypt.hash(newpassword,10);
                    console.log(Newpassword);
                    let updateuser = await User.findByIdAndUpdate({ _id: userid },{ password: Newpassword })
                    console.log(updateuser);
                    res.json({ updateuser });
                } else {
                    res.json({ message: 'password entered wrong' });
                    console.log('password entered wrong');
                }
            } catch (err) {
                console.log(err);
                res.render('./user/404.ejs')

            }

        }


    },
    edit_profile: (req, res) => {
        res.render('./user/usereditprofile', { layout: 'layout' })
    },
    edit_profile_post: async (req, res) => {
        let userId = req.params.id;
        let name = req.body.fname;
        let email = req.body.email;
        let phone = req.body.phone;
        let address = {
            unique: uuidv4(),
            housename: req.body.housename,
            street: req.body.streetname,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode
        }

        console.log(userId, name, email, phone, address);
        try {
            await User.findOneAndUpdate({ _id: userId }, { $set: { fname: name, email: email, phone: phone, address: address } });
            res.redirect('/useraccount/' + userId);
        } catch (err) {
            console.log(err);
            res.render('./user/404.ejs')

        }
    },
    add_address: async (req, res) => {
        res.render('./user/addaddress', { layout: 'layout' })
    },
    add_address_post: async (req, res) => {
        console.log(req.body);
        let userId = req.params.id;
        console.log(uuidv4());
        let address = {
            unique: uuidv4(),
            housename: req.body.housename,
            street: req.body.streetname,
            city: req.body.city,
            state: req.body.state,
            pincode: req.body.pincode

        }
        let user = await User.findOneAndUpdate({ _id: userId }, { $push: { address: address } });
        res.redirect('/useraccount/' + userId);
    },
    delete_address: async (req, res) => {
        let userid = req.params.id;
        let addressid = req.params.address;

        await User.findByIdAndUpdate({ _id: userid }, { $pull: { address: { unique: addressid } } })
        res.redirect('/useraccount/' + userid);

    },
    edit_address: async (req, res) => {
        let userId = req.params.id;
        const addressid = req.params.address;
        let matchingaddress = await User.find({ _id: userId }, { address: { $elemMatch: { unique: { $eq: addressid } } } });
        let addressarr = matchingaddress[0];
        let address = addressarr.address[0]
        res.render('./user/editaddress', { layout: 'layout', address, userId })

    },
    edit_address_post: async (req, res) => {
        let userid = req.params.id;
        let addressid = req.params.address;
        let address = req.body;
        let housename = req.body.housename;
        let street = req.body.streetname;
        let city = req.body.city;
        let state = req.body.state;
        let pincode = req.body.pincode;
        console.log(address);
        let matchingaddress = await User.find({ _id: userid }, { address: { $elemMatch: { unique: { $eq: addressid } } } });
        let addressarr = matchingaddress[0];
        let addressfind = addressarr.address[0]
        let addressupdate = await User.findOneAndUpdate({ address: { $elemMatch: { unique: { $eq: addressid } } } }, { '$set': { 'address.$.housename': housename, 'address.$.street': street, 'address.$.city': city, 'address.$.state': state, 'address.$.pincode': pincode } });
        res.redirect('/useraccount/' + userid);
    },

    get_shop_page: async (req, res) => {

        let products = await Product.find({});


        res.render('./user/shop', { layout: 'layout', products })

    },
    search_product:async (req,res)=>{
        const brand = req.body.brand;
        const price = req.body.price;
        let price1, minprice1, maxprice1;
        if(price != "All"){
        price1 = price.split("-");
         minprice1 = price1[0];
         maxprice1= price1[1];
        }
        const searchCriteria = req.body;
        console.log(searchCriteria);
       
        const minprice = Number(minprice1);
        const maxprice = Number(maxprice1);
        const shape = req.body.shape;
        const frametype = req.body.frametype;
        const color = req.body.color;
        const gender = req.body.gender
       
        let product = await Product.find({});
        let products = product.filter((el)=>{
            if(el.brand == brand || brand == "All"){
                if((el.price >= minprice && el.price <= maxprice )|| price == "All"){
                    if(el.productcategory.shape == shape || shape == "All"){
                        if(el.productcategory.frametype == frametype || frametype == "All" ){
                            if(el.productcategory.color == color || color == "All" ){
                                if(el.productcategory.gender == gender || gender == "All" ){
                                    return el;
                                }
                            
                            }
                        }
                    }
                }
            }
            
        })
        res.render('./user/shop', { layout: 'layout', products,searchCriteria})
    },
    single_view: async (req, res) => {
        let productid = req.params.id;
        let productdetails = await Product.findOne({ _id: productid });
        let Allproducts = await Product.find({}).lean();
        // console.log(productdetails);

        res.render('./user/singlepageview', { layout: 'layout', productdetails, Allproducts })
    },

    cart_page: async (req, res) => {
        const userid = req.params.id;
        const user = await User.findOne({ _id: userid });
        let cartlength = 0;
        let total = 0;
        let coupon;
        let couponValue, targetedcoupon;
        const token = req.cookies.coupon;

        if (token) {
            jwt.verify(token, process.env.jwtSecretKey, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                } else {
                    coupon = decodedToken;

                }
            })
        }
        if (coupon) {
            targetedcoupon = await Coupon.findOne({ coupon: coupon.id });
            couponValue = targetedcoupon.couponValue;
        }
        let cartqty = user.cart.map((el) => {
            cartlength++;
            return el;
        });

        let totalprice = user.cart.map((el) => {
            return el.price;
        })
        if (totalprice.length >= 1) {
            total = totalprice.reduce((acc, curr) => {
                return acc + curr;
            })
        }
        let beforecouponprice = total;
        if (targetedcoupon) {
            total = total - couponValue;
        }
        res.render('./user/cart', { layout: 'layout', cartqty, cartlength, total, couponValue, beforecouponprice })
    },
    add_to_cart: async (req, res) => {
        const productid = req.body.productid;
        const qty = req.body.qtyinp;
        const price = req.body.price
        const userid = req.body.userid;
        let product = await Product.findOne({ _id: productid });

        let cartproduct = {
            qty: qty,
            product: product,
            price: qty * price
        }

        let user = await User.findOne({ _id: userid });
        let proExist = user.cart.filter((el) => {
            return el.product === product._id;
        })
        if (proExist.length >= 1 && product.qty >= 1) {
            let cartqty = user.cart.map((el) => {
                if (el.product == productid && product.qty >= 1) {
                    el.qty++;
                }
                return el
            })

            await User.findByIdAndUpdate({ _id: userid }, { $set: { cart: cartqty } });

            user.cart = newcRT

        } else {
            if (product.qty >= 1) {
                user.cart.push(cartproduct);
            }

        }

        await user.save();
        res.json({ user });
    },

    qty_increment: async (req, res) => {
        const userid = req.body.userid;
        const qty = req.body.qty;
        const price = req.body.price;
        const count = req.body.count;
        const productid = req.body.productid;
        let total = 0;
        let coupon;
        let minValue;
        const token = req.cookies.coupon;

        if (token) {
            jwt.verify(token, process.env.jwtSecretKey, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                } else {
                    coupon = decodedToken;

                }
            })
        }
        if (coupon) {
            const targetedcoupon = await Coupon.findOne({ coupon: coupon.id });
            minValue = targetedcoupon.minAmount;
        }
        console.log(minValue);
        let user = await User.findOne({ _id: userid });
        let newcart = user.cart.map((el) => {
            if (el.product._id == productid) {
                console.log("found");
                if (count == 1) {
                    el.qty = qty;
                    el.price = price * qty;
                    console.log(el.qty, el.price);

                } else {
                    el.qty = qty;
                    el.price = price * qty;
                }
            }
            return el
        })


        let cartitems = {};
        for (let i = 0; i < newcart.length; i++) {
            if (newcart[i].product._id == productid) {
                cartitems.price = newcart[i].price;
                cartitems.qty = newcart[i].qty;
            }

        }

        let totalprice = user.cart.map((el) => {
            return el.price;
        })
        console.log(totalprice);
        if (totalprice.length >= 1) {
            total = totalprice.reduce((acc, curr) => {
                return acc + curr;
            })
        }
        console.log(total);
        if (total < minValue) {
            res.cookie('coupon', '', { maxAge: 1 })
        }

        await User.findByIdAndUpdate({ _id: userid }, { $set: { cart: newcart } });
        user.cart = newcart;
        await user.save();
        res.json({ cartitems, total });


    },
    delete_cart_product: async (req, res) => {
        let productid = req.params.id;
        let userid = req.params.userid
        let total = req.params.total
        const user = await User.findOne({ _id: userid });
        let minvalue;
        let cartproduct = {};
        user.cart.forEach((el) => {
            if (el.product._id == productid) {
                cartproduct = el;
            }
        });
        let sessioncoupon;
        const token = req.cookies.coupon;

        if (token) {
            jwt.verify(token, process.env.jwtSecretKey, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                } else {
                    sessioncoupon = decodedToken;

                }
            })
        }
        console.log(sessioncoupon);
        if(sessioncoupon){
        const targetedcoupon = await Coupon.findOne({coupon:sessioncoupon.id})
           minvalue = targetedcoupon.minAmount;
        }

        await User.updateOne({ _id: userid }, { $pull: { cart: cartproduct } });
        let cartlength = 0;
        const updateduser = await User.findOne({ _id: userid });
         updateduser.cart.map((el)=>{
            cartlength++;
        })
      
        console.log(cartlength);
        if(sessioncoupon && (total < minvalue || cartlength == 0 ) ){
            console.log(1234567898765432123456);
            res.cookie('coupon', '', { maxAge: 1 });
        }
        res.redirect('/cart/' + userid)
        console.log(cartproduct);
    },

    placeorder: async (req, res) => {
        let userid = req.params.userid;
        let coupon;
        let targetedcoupon;
        let couponValue
        console.log(userid + "hisham");

        let user = await User.findOne({ _id: userid });
        let length = 0;
        let total = 0;
        const token = req.cookies.coupon;

        if (token) {
            jwt.verify(token, process.env.jwtSecretKey, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                } else {
                    coupon = decodedToken;

                }
            })
        }
        if (coupon) {
            targetedcoupon = await Coupon.findOne({ coupon: coupon.id });
            couponValue = targetedcoupon.couponValue;
            console.log(coupon.id);
        }
        let cartproduct = user.cart.map((el) => {
            return el;

        })
        let address = user.address.map((el) => {
            return el;
        })
        let totalprice = user.cart.map((el) => {
            return el.price;
        })
        console.log(totalprice);
        if (totalprice.length >= 1) {
            total = totalprice.reduce((acc, curr) => {
                return acc + curr;
            })
        }

        if (targetedcoupon) {
            total = total - couponValue;
        }
        console.log(cartproduct);
        console.log(address);

        res.render('./user/placeorder', { layout: 'layout', cartproduct, address, length, total, couponValue });


    },
    addTo_wishlist: async (req, res) => {
        let productid = req.body.proid;
        let qty = req.body.qtyinp;
        let price = req.body.price
        let userid = req.body.userid;
        let product = await Product.findOne({ _id: productid });
        let user = await User.findOne({ _id: userid });
        let count = 0;
        let wishelement = user.whislist.map((el) => {
            return el;
        })
        wishelement.forEach((el) => {
            if (el.product._id == productid) {
                count = 1;
            }
        })

        if (count == 0) {
            let wishproduct = {
                qty: qty,
                product: product,
                price: qty * price
            }
            user.whislist.push(wishproduct);
            await user.save();
            res.json({ user });
        } else {
            res.json("alreadyexists");
        }





    },
    get_wishlist: async (req, res) => {
        let userid = req.params.id;
        let user = await User.findOne({ _id: userid });
        let wishlength = 0;
        let wishlist = user.whislist.map((el) => {
            wishlength++;
            return el;
        });
        res.render('./user/wishlist', { layout: 'layout', wishlist, wishlength })
    },


    wishlist_to_cart: async (req, res) => {
        let productid = req.body.productid;
        console.log(productid);
        let qty = req.body.qtyinp;
        let price = req.body.price
        let userid = req.body.userid;
        let productcollection = await Product.findOne({ _id: productid });
        let cartqty;
        let cartproduct = {
            qty: qty,
            product: productcollection,
            price: qty * price
        }

        let user = await User.findOne({ _id: userid });
        let proExist = user.cart.filter((el) => {
            if (el.product._id == productid) {
                return el;
            }
        })
        console.log(proExist.length, proExist);
        if (proExist.length >= 1) {
            cartqty = user.cart.map((el) => {
                if (el.product._id == productid) {
                    el.qty++;
                }
                return el
            })
            console.log(cartqty);

            await User.findByIdAndUpdate({ _id: userid }, { $set: { cart: cartqty } });



        } else {
            user.cart.push(cartproduct);
        }
        let wishlistproduct = {};
        user.whislist.forEach((el) => {
            if (el.product._id == productid) {
                console.log(123456789);
                wishlistproduct = el;
            }
        })
        console.log(typeof (wishlistproduct));
        //await User.findByIdAndUpdate({_id:userid},{$pull:{whislist:{_id:wishlistproduct.product._id}}})
        await User.updateOne({ _id: userid }, { $pull: { whislist: wishlistproduct } });
        console.log(654321);

        await user.save();
        res.json({ user });

    },
    delete_wish_product: async (req, res) => {
        let productid = req.params.id;
        let userid = req.params.userid
        let user = await User.findOne({ _id: userid });
        let wishlistproduct = {};
        user.whislist.forEach((el) => {
            if (el.product._id == productid) {
                wishlistproduct = el;
            }
        })
        await User.updateOne({ _id: userid }, { $pull: { whislist: wishlistproduct } });
        res.redirect('/wishlist/' + userid);
    },

    place_order: async (req, res) => {
        const userid = req.body.userid;
        const total = req.body.total;
        let usercoupon;
        const token = req.cookies.coupon;

        if (token) {
            jwt.verify(token, process.env.jwtSecretKey, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                } else {
                    usercoupon = decodedToken;

                }
            })
        }
        const user = await User.findOne({ _id: userid })
        const cartitems = user.cart.map((el) => {
            return el;
        })
        const status = req.body.paymentmethod == 'cod' ? 'placed' : 'pending'
        const orders = {
            fname: req.body.fname,
            phone: req.body.phone,
            address: req.body.address,
            paymentmethod: req.body.paymentmethod,
            total: total,
            status: status
        }
        await Order.create({ products: cartitems, order: orders, user: userid }).then(async (orderDetails) => {

            if (req.body.paymentmethod == 'cod') {
                if (usercoupon) {
                    const coupons = await Coupon.findOne({ coupon: coupon.id });
                    coupons.userid.push(userid);
                    await coupons.save();
                    res.cookie('coupon', '', { maxAge: 1 }).json({ success: true, data: orderDetails });
                }else{
                    res.json({ success: true, data: orderDetails });
                }
                
                await User.updateOne({ _id: userid }, { $set: { cart: [] } }, { multi: true });
                const order = await Order.findOne({ _id: orderDetails._id });
                const proandqty = order.products.map((el) => {
                    return productid = {
                        id: el.product._id,
                        qty: el.qty
                    }
                })
                proandqty.forEach(async (el) => {
                    const targetedProduct = await Product.findOne({ _id: el.id });
                    targetedProduct.qty = targetedProduct.qty - el.qty;
                    targetedProduct.save();
                })
               
            }
            if (req.body.paymentmethod == 'card') {
                generateRazorpay(objectId(orderDetails._id), total, userid).then(async (response) => {
                    
                    if (usercoupon) {
                        const coupons = await Coupon.findOne({ coupon: coupon.id });
                        coupons.userid.push(userid);
                        await coupons.save();
                        res.cookie('coupon', '', { maxAge: 1 }).json(response);
                    }else{
                        res.json(response)
                    }
                })
            }

        });
    },
    order_confirmation: (req, res) => {
        let orderid = req.params.orderid;
        console.log(orderid);
        res.render('./user/orderconfirmation', { layout: 'layout', orderid })
    },
    verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            console.log(details);
            let hmac = crypto.createHmac('sha256', '0iA8p66fFN3Du3Pzl01fcg00').update(details.payment.razorpay_order_id + '|' + details.payment.razorpay_payment_id).digest('hex');
            if (hmac === details.payment.razorpay_signature) {
                resolve();
                console.log("inside hmac");
            } else {
                reject();
            }

        })
    },
    changepaymentstatus: async (orderId, userId,orderobj) => {
        console.log(orderId + "hai order id ");
        let productid = {};



        return new Promise(async (resolve, reject) => {
            await Order.findByIdAndUpdate({ _id: orderId },
                {
                    $set: {
                        "order.status": 'placed'
                    }
                }

            ).then(async () => {
                resolve()
                await User.updateOne({ _id: userId }, { $set: { cart: [] } }, { multi: true });
                const order = await Order.findOne({ _id: orderId });
                const proandqty = order.products.map((el) => {
                    return productid = {
                        id: el.product._id,
                        qty: el.qty
                    }
                })
                proandqty.forEach(async (el) => {
                    const targetedProduct = await Product.findOne({ _id: el.id });
                    targetedProduct.qty = targetedProduct.qty - el.qty;
                    targetedProduct.save();
                })
                const paymentid = orderobj.payment.razorpay_payment_id;
                console.log(paymentid);
             await Order.findByIdAndUpdate({_id:orderId},{$set:{transactionid:paymentid}});
              

            }).catch((err) => {
                console.log(err);
            })


        })
    },
    view_order: async (req, res) => {
        let userid = req.params.userid
        
        let order = await Order.find({ user: userid }).sort({"orderDate":-1});
        const refund = await Refund.find({});
      
       
        
        let date =  order.map((order)=>{
            return order.orderDate.toLocaleString();
        })
       // let date = humandate.prettyPrint(order.orderDate);
        res.render('./user/vieworder', { layout: 'layout', order,refund,date})
    },


    get_refund_page:async (req,res)=>{
        const orderid = req.params.orderid;
        const orders = await Order.findOne({_id:orderid});
        console.log(orders);
        res.render('./user/ordercancelpage',{orders,layout:'layout'});

    },

    intiate_refund:async (req,res)=>{
        const orderid = req.params.orderid;
        const userid = req.params.userid;
        console.log(req.body);
        const Totalamount = req.body.tamount;
        const reason = req.body.reason;
        const fname = req.body.fullname;
        const email = req.body.email

        const order = await Order.findOne({_id:orderid});
        const transactionid = order.transactionid;
        const refundreq = await Refund.create({fname:fname,email:email,user:userid,refundAmount:Totalamount,orderid:orderid,reason:reason,transactionid:transactionid});
        res.render('./user/refundprocessing', { layout: 'layout', order,refundreq})
    


         

    },

    apply_coupon: async (req, res) => {
        console.log(req.body);
        const userId = req.body.userid;
        let total = req.body.total;
        let sessioncoupon;
        const couponcode = req.body.codevalue;
        let user = await User.findOne({ _id: userId })
        let totalprice = user.cart.map((el) => {
            return el.price;
        })
        const targetedcoupon = await Coupon.findOne({ coupon: couponcode });
        const discountvalue = coupon.couponValue;
        const token = req.cookies.coupon;

        if (token) {
            jwt.verify(token, process.env.jwtSecretKey, (err, decodedToken) => {
                if (err) {
                    console.log(err.message);
                } else {
                    sessioncoupon = decodedToken;

                }
            })
        }

        if (targetedcoupon) {
            if (sessioncoupon) {
                res.json("Already applied a coupon");
            } else {

                if (targetedcoupon.userid.length == 0) {
                    if (total >= targetedcoupon.minAmount && total <= targetedcoupon.maxAmount) {
                        let token = createToken(couponcode);
                        total = total - targetedcoupon.couponValue;
                        res.cookie('coupon', token, { httpOnly: true, maxAge: maxAge * 1000 });
                        res.json({ total, discountvalue });
                       
                      

                    } else {
                        res.json(`The total amount must be between $ ${targetedcoupon.minAmount}.00 and $ ${targetedcoupon.maxAmount}.00 to use this Coupon`)
                        
                    }

                } else {
                    const useridexist = targetedcoupon.userid.map(async (user) => {
                        if(user==userId){
                            return user;
                        }

                    })

                        if (useridexist) {
                            console.log("exist");
                            
                            res.json("Coupon already used");
                            console.log(1234560987654);
                           return;
                          
                        } 
                         if (total >= targetedcoupon.minAmount && total <= targetedcoupon.maxAmount) {
                                let token = createToken(couponcode);
                                total = total - targetedcoupon.couponValue;
                                res.cookie('coupon', token, { httpOnly: true, maxAge: maxAge * 1000 })
                                res.json({ total, discountvalue });
                              
                               

                            } else {
                                res.json(`The total amount must be between ${targetedcoupon.minAmount} and ${targetedcoupon.maxAmount} to use this Coupon`)
                               
                            }
                        

                
                }
            }
        } else {
            res.json("Invalid coupon");

        }


    },
    get_contact:(req,res)=>{
        res.render('./user/contactus',{layout:"layout"});
    }


}

