const Router = require('express')
const router = Router();
const userhelper = require('../controller/userhelper');


//const client = require('twilio')(process.env.account_SID,process.env.authToken);


router.get('/',userhelper.homePage);
router.get('/signup',userhelper.getsignUp)
router.post('/signup',userhelper.dosignup);
router.get('/login',userhelper.getlogin)





module.exports = router;