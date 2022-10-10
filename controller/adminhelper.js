const Admin = require('../model/adminSchema');
const jwt = require('jsonwebtoken');



module.exports = {
    admin_login:(req,res)=>{
        res.render('/admin/adminlogin',{layout:""})
    }
}