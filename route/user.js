const Router = require('express')
const router = Router();


//const client = require('twilio')(process.env.account_SID,process.env.authToken);


router.get('/',(req,res)=>{
    res.render('./user/index')
})

router.post('/signup',(req,res)=>{

    res.redirect('/login');
})
module.exports = router;