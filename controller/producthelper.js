const Admin = require('../model/adminSchema');
const Product = require('../model/productschema');



module.exports = {
    getProductlist:async (req,res) =>{
        let products = await Product.find({}).lean();
        res.render('./admin/productlist',{products,layout:'adminlayout'});
    }
}