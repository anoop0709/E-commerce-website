const Router = require('express')
const router = Router();
const userhelper = require('../controller/userhelper');
const userauthMiddleware = require('../middleware/userauthMiddleware');
const { checkAuth } = require('../middleware/userauthMiddleware');
const authMiddleware = require('../middleware/userauthMiddleware');



//homepage -->
router.get('/',authMiddleware.checkUser,userhelper.homePage,authMiddleware.checkAuth);
//homepage -->

//user login and signup -->
router.get('/signup',authMiddleware.checkAuth,authMiddleware.checkUser,userhelper.getsignUp)
router.post('/signup',userhelper.dosignup);


router.post('/sendnotification',userhelper.sendOtp);
router.post('/verify-otp',userhelper.otpVerification);
router.post('/signin-with-otp',userhelper.signinwith_otp)


router.get('/login',authMiddleware.checkAuth,authMiddleware.checkUser,userhelper.getlogin);
router.post('/login',userhelper.doLogin);

router.get('/logout',userhelper.getlogout);
//user login and signup ---->


//user account routes--->
router.get('/useraccount/:id',authMiddleware.checkUser,userhelper.userAccount);

router.get('/addaddress',authMiddleware.checkUser,userhelper.add_address);
router.post('/addaddress/:id',authMiddleware.checkUser,userhelper.add_address_post);

router.get('/passwordreset',authMiddleware.checkUser,userhelper.reset_password);
router.post('/passwordreset',authMiddleware.checkUser,userhelper.reset_password_post);

router.get('/userprofileedit/:id',authMiddleware.checkUser,userhelper.edit_profile);
router.post('/userprofileedit/:id',authMiddleware.checkUser,userhelper.edit_profile_post)

router.get('/addressedit/:id/:address',authMiddleware.checkUser,userhelper.edit_address);
router.post('/addressedit/:id/:address',authMiddleware.checkUser,userhelper.edit_address_post);

router.get('/addressdelete/:id/:address',authMiddleware.checkUser,userhelper.delete_address);

//user account routes--->

//shop page-->
router.get('/shop',authMiddleware.checkUser,userhelper.get_shop_page)
router.get('/wishlist/:id',authMiddleware.checkUser,userhelper.get_wishlist)
router.post('/wishlist',authMiddleware.checkUser,userhelper.addTo_wishlist);
router.post('/carttowishlist',authMiddleware.checkUser,userhelper.wishlist_to_cart);
router.get('/deletewishlistitem/:id/:userid',authMiddleware.checkUser,userhelper.delete_wish_product);


//single page view-->
router.get('/singlepage/:id',authMiddleware.checkUser,userhelper.single_view);

//cart page

router.get('/cart/:id',authMiddleware.checkUser,userhelper.cart_page);
router.post('/cart',authMiddleware.checkUser,userhelper.add_to_cart);

router.post('/qtyincrement',authMiddleware.checkUser,userhelper.qty_increment);
router.get('/deletecartproduct/:id/:userid',authMiddleware.checkUser,userhelper.delete_cart_product);

//place order

router.get('/placeorder/:id',authMiddleware.checkUser,userhelper.placeorder);
router.post('/placeorder',userauthMiddleware.checkUser,userhelper.place_order);

router.post('/verify-payment',authMiddleware.checkUser,async (req,res)=>{
    console.log(req.body+ "body in verifypayment");
    let orderobj = req.body;
    console.log(orderobj.userid);
   await userhelper.verifyPayment(req.body).then(()=>{
     userhelper.changepaymentstatus(orderobj.order.receipt,orderobj.userid).then(()=>{
        res.json({status:true})
      }).catch((err)=>{
        console.log(err);
        res.json({status:false})
      })
  
    })
  
  });
  router.get('/orderconfirmation/:orderid',authMiddleware.checkUser,userhelper.order_confirmation);
  router.get('/view-order',authMiddleware.checkUser,userhelper.view_order)

module.exports = router;