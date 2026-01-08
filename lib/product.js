const { fileLoader } = require('ejs');
const db = require('./db');
var sanitizeHtml = require('sanitize-html');

function authIsOwner(req,res){
    var name = 'Guest';
    var login = false;
    var cls = 'NON';
    if(req.session.is_logined){
        name = req.session.name;
        login = true;
        cls = req.session.cls;
    }
    return {name,login,cls}
}

module.exports = {
    view : (req,res)=>{
        var{login,name,cls} = authIsOwner(req,res)
        //var products = '';

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product;`
        var sql3 = `select * from code;`
        
        db.query(sql1+sql2+sql3,(error,results) => {
           
            var context = {
                who : name,
                login : login,
                body : 'product.ejs',
                cls : cls,
                boardtype : results[0],
                products : results[1],
                codem : results[2],
                path: req.path
           };

           req.app.render('mainFrame',context,(err,html)=> {
                res.end(html);
           })

            
        })

    },

    create : (req,res) =>{

        var{login,name,cls} = authIsOwner(req,res)
        //var categorys = '';

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1+sql2,(error,results) => {
            if (error) {
                console.log("Error:", error);
                res.status(500).send("Database query error");
                return;
            }
            
           
            var context = {
                who : name,
                login : login,
                body : 'productCU.ejs',
                cls : cls,
                boardtype : results[0],
                categorys : results[1],
                codem : results[1],
                product : null
           };

           req.app.render('mainFrame',context,(err,html)=> {
            if (err) {
                console.log("Render error:", err);
                res.status(500).send("Template render error");
                return;
            }
                res.end(html);
           })

            
        })
    },

    create_process : (req,res) => {
        var file = 'image/' + req.file.filename
        var product = req.body;
        sntzedCategory = sanitizeHtml(product.category)
        var main_id = sntzedCategory.substr(0,4)
        var sub_id = sntzedCategory.substr(4,4)
        sntzedName = sanitizeHtml(product.name)
        sntzedPrice = parseInt(sanitizeHtml(product.price))
        sntzedStock = parseInt(sanitizeHtml(product.stock))
        sntzedBrand = sanitizeHtml(product.brand)
        sntzedSupplier = sanitizeHtml(product.supplier)
        sntzedFile = file

        sntzedSaleYn = sanitizeHtml(product.sale_yn)
        sntzedSalePrice = parseInt(sanitizeHtml(product.sale_price))
    
  
        db.query('INSERT INTO product (main_id, sub_id, name, price, stock, brand, \
            supplier, image, sale_yn, sale_price) \
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [main_id, sub_id, sntzedName, sntzedPrice, sntzedStock, sntzedBrand, sntzedSupplier,
                sntzedFile, sntzedSaleYn, sntzedSalePrice], (error, result) => {
                    console.log(result)
                if (error) {throw error;}             
                res.redirect('/product/view'); 
            }
        );

    },

    update: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);
        var sanitizedMerId = parseInt(sanitizeHtml(req.params.mer_id));
    
        // 상품 정보를 조회합니다.
        db.query(
            'SELECT * FROM product WHERE mer_id = ?',
            [sanitizedMerId],
            (error, results) => {
                if (error) {
                    console.log("Error:", error);
                    res.status(500).send("Database query error");
                    return;
                }
                
    
                // 카테고리 정보를 조회

                var sql1 = `select * from boardtype;`
                var sql2 = `select * from code;`
                db.query(sql1+sql2, (error, cresults) => {
                    if (error) {
                        throw error;
                    }
    
                    var context = {
                        who: name,
                        login: login,
                        body: 'productCU.ejs',
                        cls: cls,
                        product: results[0],
                        boardtype : cresults[0],
                        categorys: cresults[1],
                        codem : cresults[1] 
                    };
    
                    req.app.render('mainFrame', context, (err, html) => {
                        if (err) {
                            console.log("Render error:", err);
                            res.status(500).send("Template render error");
                            return;
                        }
                        res.end(html);
                    });
                });
            }
        );
    },
    

    update_process: (req, res) => {
        var product = req.body;
        var sanitizedMerId = parseInt(sanitizeHtml(req.body.mer_id));
    
        // 기존 이미지 경로를 데이터베이스에서 조회
        db.query('SELECT image FROM product WHERE mer_id = ?', [sanitizedMerId], (error, results) => {
            if (error) {
                throw error;
            }
    
            // 기존 이미지 가져오기
            var existingImage = results.length > 0 ? results[0].image : null;
            var sntzedFile;
    
            // 새 파일이 업로드된 경우, 새 파일의 이름을 사용
            if (req.file) {
                sntzedFile = 'image/' + req.file.filename;
            } else {
                sntzedFile = existingImage; // 새 파일이 없으면 기존 이미지 사용
            }
    
            sntzedCategory = sanitizeHtml(product.category);
            var main_id = sntzedCategory.substr(0, 4);
            var sub_id = sntzedCategory.substr(4, 4);
            sntzedName = sanitizeHtml(product.name);
            sntzedPrice = parseInt(sanitizeHtml(product.price));
            sntzedStock = parseInt(sanitizeHtml(product.stock));
            sntzedBrand = sanitizeHtml(product.brand);
            sntzedSupplier = sanitizeHtml(product.supplier);
            sntzedSaleYn = sanitizeHtml(product.sale_yn);
            sntzedSalePrice = parseInt(sanitizeHtml(product.sale_price));
    
            db.query(
                'UPDATE product SET main_id = ?, sub_id = ?, name = ?, price = ?, stock = ?, brand = ?, supplier = ?, image = ?, sale_yn = ?, sale_price = ? WHERE mer_id = ?',
                [main_id, sub_id, sntzedName, sntzedPrice, sntzedStock, sntzedBrand, sntzedSupplier, sntzedFile, sntzedSaleYn, sntzedSalePrice, sanitizedMerId],
                (error, result) => {
                    if (error) {
                        throw error;
                    }
                    res.redirect('/product/view');
                }
            );
        });
    },

    delete_process : (req,res) => {

        var sanitizedMerId = parseInt(sanitizeHtml(req.params.mer_id));
    
        db.query(`DELETE FROM product WHERE mer_id = ?`, 
            [sanitizedMerId], (error, result) => {
                if (error) {
                    throw error;
                }
    
                res.redirect('/product/view'); 
            }
        );
    }
    

}