const Admin = require('../model/adminSchema');
const Product = require('../model/productschema');



module.exports = {
    getProductlist:async (req,res) =>{
        //let page = req.query.page;
    let limit = 9;
        //let skip = page*9;
        let page = req.query.page >= 1 ? req.query.page : 1;
        page = page-1;
        let products = await Product.find({}).lean().limit(9).skip(page*limit);
        res.render('./admin/productlist',{products,layout:'adminlayout'});
    }
}