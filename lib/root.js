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
    home : (req,res)=>{
        var{login,name,cls} = authIsOwner(req,res)
        
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product;`
        var sql3 = `select * from code;`
        
        db.query(sql1+sql2+sql3,(error,results) => {
            if (error) {
                console.log("Database query error:", error);
                res.status(500).send("Database query error");
                return;
            }
           
            var context = {
                who : name,
                login : login,
                body : 'product.ejs',
                cls : cls,
                products : results[1],
                path: req.path,
                boardtype : results[0],
                codem : results[2]
           };

           res.render('mainFrame',context,(err,html)=> {
            if (err) {
                console.log("Render error:", err);
                res.status(500).send("Template render error");
                return;
            }
                res.end(html);
           })

            
        })

    },

    categoryview : (req,res) =>{
        var{login,name,cls} = authIsOwner(req,res)
        

        var sntzedId = sanitizeHtml(req.params.categ);
        var main_id = sntzedId.substring(0,4);
        var sub_id = sntzedId.substring(4,8);

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product where main_id = ${main_id} AND sub_id = ${sub_id};`
        var sql3 = `select * from code;`
        
        db.query(sql1+sql2+sql3,(error,results) => {
            if (error) {
                console.log("Database query error:", error);
                res.status(500).send("Database query error");
                return;
            }
           
            var context = {
                who : name,
                login : login,
                body : 'product.ejs',
                cls : cls,
                products : results[1],
                path: req.path,
                boardtype : results[0],
                codem : results[2]
           };

           res.render('mainFrame',context,(err,html)=> {
            if (err) {
                console.log("Render error:", err);
                res.status(500).send("Template render error");
                return;
            }
                res.end(html);
           })

            
        })
    },

    search : (req,res) => {

        var{login,name,cls} = authIsOwner(req,res)

        var body = req.body;
        

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product where name like '%${body.search}%' or brand like '%${body.search}%' or supplier like '%${body.search}%';`
        var sql3 = `select * from code;`
        
        db.query(sql1+sql2+sql3,(error,results) => {
            if (error) {
                console.log("Database query error:", error);
                res.status(500).send("Database query error");
                return;
            }
           
            var context = {
                who : name,
                login : login,
                body : 'product.ejs',
                cls : cls,
                products : results[1],
                path: req.path,
                boardtype : results[0],
                codem : results[2]
           };

           res.render('mainFrame',context,(err,html)=> {
            if (err) {
                console.log("Render error:", err);
                res.status(500).send("Template render error");
                return;
            }
                res.end(html);
           })      
        })
    },

    detail : (req,res) => {

        var{login,name,cls} = authIsOwner(req,res)

        var sntzedMerId = parseInt(sanitizeHtml(req.params.merId));
        

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from product where mer_id = ${sntzedMerId};`
        var sql3 = `select * from code;`
        
        db.query(sql1+sql2+sql3,(error,results) => {
            if (error) {
                console.log("Database query error:", error);
                res.status(500).send("Database query error");
                return;
            }
           
            var context = {
                who : name,
                login : login,
                body : 'productDetail.ejs',
                cls : cls,
                products : results[1],
                path: req.path,
                boardtype : results[0],
                codem : results[2]
           };

           res.render('mainFrame',context,(err,html)=> {
            if (err) {
                console.log("Render error:", err);
                res.status(500).send("Template render error");
                return;
            }
                res.end(html);
           })      
        })
    },

    cartview: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);  
    
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `
            SELECT c.cart_id AS cart_id, c.loginid, pr.name AS cname, p.mer_id, p.name AS pname, c.date
            FROM cart AS c
            JOIN person AS pr ON c.loginid = pr.loginid
            JOIN product AS p ON c.mer_id = p.mer_id;
        `;
        var sql3 = `SELECT * FROM code;`;
    
        db.query(sql1 + sql3, (error, results) => {
            if (error) {
                console.log("Database query error:", error);
                return res.status(500).send("Database query error");
            }
    
            var boardtype = results[0];
            var codem = results[1];
    
            db.query(sql2, (selectError, cartResult) => {
                if (selectError) {
                    console.log("Select query error:", selectError);
                    return res.status(500).send("Select query error");
                }
    
                var context = {
                    who: name,
                    login: login,
                    body: 'cartView.ejs',
                    cls: cls,
                    boardtype: boardtype,
                    codem: codem,
                    cartlist: cartResult
                };
    
                res.render('mainFrame', context, (renderError, html) => {
                    if (renderError) {
                        console.log("Render error:", renderError);
                        return res.status(500).send("Template render error");
                    }
                    res.end(html);
                });
            });
        });
    },
    
    cartupdate: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res); 
        var sntzedCartId = parseInt(sanitizeHtml(req.params.cartId)); 
    
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `
            SELECT c.cart_id AS cart_id, c.loginid AS loginid, pr.name AS cname, p.mer_id AS mer_id, p.name AS pname, c.date
            FROM cart AS c
            JOIN person AS pr ON c.loginid = pr.loginid
            JOIN product AS p ON c.mer_id = p.mer_id
            WHERE c.cart_id = ?;
        `;
        var sql4 = `SELECT name, loginid FROM person where class = 'CST';`;
        var sql5 = `SELECT name, mer_id FROM product;`; 
    
        db.query(sql1 + sql2, (error, results) => {
            if (error) {
                console.log("Database query error:", error);
                return res.status(500).send("Database query error");
            }
    
            var boardtype = results[0];
            var codem = results[1];
    
            db.query(sql3, [sntzedCartId], (selectError, selectedResult) => {
                if (selectError) {
                    console.log("Select query error:", selectError);
                    return res.status(500).send("Select query error");
                }
    
                if (selectedResult.length === 0) {
                    return res.status(404).send("Cart item not found");
                }
    
                db.query(sql4 + sql5, (errorCustomersProducts, customerProductResults) => {
                    if (errorCustomersProducts) {
                        console.log("Select query error for customers and products:", errorCustomersProducts);
                        return res.status(500).send("Select query error for customers and products");
                    }
    
                    var customers = customerProductResults[0];
                    var products = customerProductResults[1];
    
                    var context = {
                        who: name,
                        login: login,
                        body: 'cartU.ejs',
                        cls: cls,
                        boardtype: boardtype,
                        codem: codem,
                        selected: selectedResult[0],
                        customers: customers,
                        products: products
                    };
    
                    res.render('mainFrame', context, (renderError, html) => {
                        if (renderError) {
                            console.log("Render error:", renderError);
                            return res.status(500).send("Template render error");
                        }
                        res.end(html);
                    });
                });
            });
        });
    },
    
    
    

    cartupdate_process: (req, res) => {
       
        var sntzedCartId = parseInt(sanitizeHtml(req.body.cart_id));
        var sntzedCustomer = sanitizeHtml(req.body.customer);
        var sntzedProduct = parseInt(sanitizeHtml(req.body.product));

        var sql = `
            UPDATE cart
            SET loginid = ?, mer_id = ?, date = NOW()
            WHERE cart_id = ?;
        `;
    
        var values = [sntzedCustomer, sntzedProduct, sntzedCartId];
    
        db.query(sql, values, (error, results) => {
            if (error) {
                console.log("Update query error:", error);
                return res.status(500).send("Database update error");
            }

            res.redirect('/cartview');
        });
    },

    cartdelete_process : (req,res) => {

        var sntzedCartId = parseInt(sanitizeHtml(req.params.cartId));

        var sql = `DELETE FROM cart where cart_id = ${sntzedCartId};`;

        db.query(sql,(error,results)=>{
            if(error) {
                console.log("Delete query error:", error);
                return res.status(500).send("Database delete error");}

            res.redirect('/cartview');

        })

    },
    
    purchaseview : (req,res) => {

        var { login, name, cls } = authIsOwner(req, res); 
    
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `
            SELECT pu.purchase_id AS purchase_id ,pu.loginid AS loginid, pe.name AS cname , pu.mer_id AS mer_id, pr.name AS pname, pu.date AS date, pu.price AS price, pu.point AS point, pu.qty AS qty , pu.total AS total, pu.payYN AS payYN, pu.cancel AS cancel, pu.refund AS refund
            FROM purchase AS pu
            JOIN person AS pe ON pu.loginid = pe.loginid
            JOIN product AS pr ON pu.mer_id = pr.mer_id;
        `;
        var sql3 = `SELECT * FROM code;`;

        db.query(sql1 + sql3, (error, results) => {
            if (error) {
                console.log("Database query error:", error);
                return res.status(500).send("Database query error");
            }
    
            var boardtype = results[0];
            var codem = results[1];

            db.query(sql2, (selectError, purchaseResult) => {
                if (selectError) {
                    console.log("Select query error:", selectError);
                    return res.status(500).send("Select query error");
                }
    
                var context = {
                    who: name,
                    login: login,
                    body: 'purchaseView.ejs',
                    cls: cls,
                    boardtype: boardtype,
                    codem: codem,
                    purchaselist: purchaseResult
                };
    
                res.render('mainFrame', context, (renderError, html) => {
                    if (renderError) {
                        console.log("Render error:", renderError);
                        return res.status(500).send("Template render error");
                    }
                    res.end(html);
                });
            });
        });

    },

    purchaseupdate : (req,res) => {

        var { login, name, cls } = authIsOwner(req, res);

        var sntzedPurchaseId = parseInt(sanitizeHtml(req.params.purchaseId));
    
        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT * FROM code;`;
        var sql3 = `
            SELECT pu.purchase_id AS purchase_id, pu.loginid AS loginid, pe.name AS cname, pu.mer_id AS mer_id, pr.name AS pname, pu.date AS date, pu.price AS price, pu.point AS point, pu.qty AS qty, pu.total AS total, pu.payYN AS payYN, pu.cancel AS cancel, pu.refund AS refund
            FROM purchase AS pu
            JOIN person AS pe ON pu.loginid = pe.loginid
            JOIN product AS pr ON pu.mer_id = pr.mer_id
            where pu.purchase_id = ?;
        `;
        var sql4 = `SELECT name, loginid FROM person where class = 'CST';`; 
        var sql5 = `SELECT name, mer_id FROM product;`; 

        db.query(sql1 + sql2, (error, results) => {
            if (error) {
                console.log("Database query error:", error);
                return res.status(500).send("Database query error");
            }
    
            var boardtype = results[0];
            var codem = results[1];
    

            db.query(sql3, [sntzedPurchaseId], (selectError, selectedResult) => {
                if (selectError) {
                    console.log("Select query error:", selectError);
                    return res.status(500).send("Select query error");
                }
    
                if (selectedResult.length === 0) {
                    return res.status(404).send("Cart item not found");
                }
    

                db.query(sql4 + sql5, (errorCustomersProducts, customerProductResults) => {
                    if (errorCustomersProducts) {
                        console.log("Select query error for customers and products:", errorCustomersProducts);
                        return res.status(500).send("Select query error for customers and products");
                    }
    
                    var customers = customerProductResults[0];
                    var products = customerProductResults[1];
    
                    var context = {
                        who: name,
                        login: login,
                        body: 'purchaseU.ejs',
                        cls: cls,
                        boardtype: boardtype,
                        codem: codem,
                        selected: selectedResult[0], 
                        customers: customers,
                        products: products
                    };
    
                    res.render('mainFrame', context, (renderError, html) => {
                        if (renderError) {
                            console.log("Render error:", renderError);
                            return res.status(500).send("Template render error");
                        }
                        res.end(html);
                    });
                });
            });
        });

    },

    purchaseupdate_process : (req,res) => {

        var sntzedPurchaseId = parseInt(sanitizeHtml(req.body.purchase_id));
        var sntzedCustomer = sanitizeHtml(req.body.customer);
        var sntzedProduct = parseInt(sanitizeHtml(req.body.product));
        var sntzedPrice = parseInt(sanitizeHtml(req.body.price));
        var sntzedPoint = parseInt(sanitizeHtml(req.body.point));
        var sntzedQty = parseInt(sanitizeHtml(req.body.qty));
        var sntzedTotal = parseInt(sanitizeHtml(req.body.total));

        var sntzedPayYN = sanitizeHtml(req.body.payYN);
        var sntzedCancel = sanitizeHtml(req.body.cancel);
        var sntzedRefund = sanitizeHtml(req.body.refund);

    
        var sql = `
            UPDATE purchase
            SET loginid = ?, mer_id = ?, date = NOW(), price = ?, point = ?, qty = ?, total = ?, payYN = ?, cancel = ?, refund = ? 
            WHERE purchase_id = ?;
        `;
    
        var values = [sntzedCustomer, sntzedProduct, sntzedPrice, sntzedPoint, sntzedQty, sntzedTotal, sntzedPayYN, sntzedCancel, sntzedRefund, sntzedPurchaseId];
    
        db.query(sql, values, (error, results) => {
            if (error) {
                console.log("Update query error:", error);
                return res.status(500).send("Database update error");
            }
    
            res.redirect('/purchaseview');
        });

    },

    purchasedelete_process : (req,res) => {

        var sntzedPurchaseId = parseInt(sanitizeHtml(req.params.purchaseId));

        var sql = `DELETE FROM purchase where purchase_id = ${sntzedPurchaseId};`;

        db.query(sql,(error,results)=>{
            if(error) {
                console.log("Delete query error:", error);
                return res.status(500).send("Database delete error");}

            res.redirect('/purchaseview');

        })
    },

    table : (req,res) => {

        var{login,name,cls} = authIsOwner(req,res)

        
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        var sql3 = `SELECT * FROM INFORMATION_SCHEMA.TABLES where table_schema = 'webdb2024';`
        
        db.query(sql1+sql2+sql3,(error,results) => {
            if (error) {
                console.log("Database query error:", error);
                res.status(500).send("Database query error");
                return;
            }
           
            var context = {
                who : name,
                login : login,
                body : 'tableManage.ejs',
                cls : cls,
                boardtype : results[0],
                codem : results[1],
                table : results[2]
           };

           res.render('mainFrame',context,(err,html)=> {
            if (err) {
                console.log("Render error:", err);
                res.status(500).send("Template render error");
                return;
            }
                res.end(html);
           })      
        })

    },

    tableview: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);
        var tableName = sanitizeHtml(req.params.table_name);
        var sql1 = `
            SELECT COLUMN_NAME, COLUMN_COMMENT, COLUMN_KEY
            FROM information_schema.columns
            WHERE table_schema= 'webdb2024' AND table_name= ?;
        `;
        var sql2 = `SELECT * FROM ${tableName};`; // 테이블명을 직접 쿼리에 삽입
        var sql3 = `SELECT * FROM boardtype;`;
        var sql4 = `SELECT * FROM code;`;
    
        db.query(sql3 + sql4, (error, results) => {
            if (error) {
                console.log("Database query error for boardtype or code:", error);
                return res.status(500).send("Database query error for boardtype or code");
            }
    
            var boardtype = results[0];
            var codem = results[1];
    
            db.query(sql1, [tableName], (error, commentResults) => {
                if (error) {
                    console.log("Database query error for comments:", error);
                    return res.status(500).send("Database query error for comments");
                }
    
                db.query(sql2, (error, rowResults) => {
                    if (error) {
                        console.log("Database query error for rows:", error);
                        return res.status(500).send("Database query error for rows");
                    }
    
                    var context = {
                        login: login,
                        who: name,
                        cls: cls,
                        body: 'tableView.ejs',
                        tableName: tableName,
                        comments: commentResults.filter(comment => comment.COLUMN_KEY !== 'PRI'), // 기본키 제외
                        rows: rowResults,
                        boardtype: boardtype,
                        codem: codem
                    };
    
                    res.render('mainFrame', context, (err, html) => {
                        if (err) {
                            console.log("Render error:", err);
                            return res.status(500).send("Template render error");
                        }
                        res.end(html);
                    });
                });
            });
        });
    },
    
    analview : (req,res) => {

        var{login,name,cls} = authIsOwner(req,res)

        
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        var sql3 = `select address,ROUND(( count(*) / ( select count(*) from person )) * 100, 2) as rate
from person group by address;`
        
        db.query(sql1+sql2+sql3,(error,results) => {
            if (error) {
                console.log("Database query error:", error);
                res.status(500).send("Database query error");
                return;
            }
           
            var context = {
                who : name,
                login : login,
                body : 'ceoAnal.ejs',
                cls : cls,
                boardtype : results[0],
                codem : results[1],
                percentage : results[2]
           };

           res.render('mainFrame',context,(err,html)=> {
            if (err) {
                console.log("Render error:", err);
                res.status(500).send("Template render error");
                return;
            }
                res.end(html);
           })      
        })


    }
    
    

}