const express= require('express');
const router= express.Router();
var purchase = require('../lib/purchase');

router.get('/detail/:merId', (req,res)=>{
    purchase.purchasedetail(req,res);
})

router.post('/submit', (req,res) =>{
    purchase.purchasesubmit(req,res);
})

router.get('/',(req,res)=>{
    purchase.purchase(req,res);
})

router.post('/cancel/:purchaseId', (req, res) => {
    purchase.purchasecancel(req, res);
})

router.post('/cart/submit',(req,res)=>{
    purchase.cartsubmit(req,res);
})

router.get('/cart',(req,res)=>{
    purchase.cart(req,res);
})

router.post('/cart/delete',(req,res)=>{
    purchase.cartdelete(req,res);
})

router.post('/cart/buy',(req,res)=>{
    purchase.cartbuy(req,res);
})

module.exports = router;