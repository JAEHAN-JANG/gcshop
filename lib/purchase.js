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

    purchasedetail : (req,res) => {
        var{login,name,cls} = authIsOwner(req,res)

        var sntzedMerId = parseInt(sanitizeHtml(req.params.merId));
        
        var loginid = req.session.loginid;

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
                body : 'purchaseDetail.ejs',
                cls : cls,
                products : results[1],
                path: req.path,
                boardtype : results[0],
                codem : results[2],
                loginid : loginid,
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

    // 구매 데이터 삽입 후 리다이렉트
    purchasesubmit: (req, res) => {
        const { loginid, mer_id, price, qty } = req.body;
        const total = price * qty;

        // 구매 데이터 삽입
        const insertQuery = `INSERT INTO purchase (loginid, mer_id, date, price, qty, total, payYN, point) VALUES (?, ?, NOW(), ?, ?, ?, 'Y', '0')`;
        db.query(insertQuery, [loginid, mer_id, price, qty, total], (insertError) => {
            if (insertError) {
                console.log("Insert query error:", insertError);
                return res.status(500).send("Insert query error");
            }

            // 삽입 후 /purchase로 리다이렉트
            res.redirect('/purchase');
        });
    },

    // purchase 데이터 조회 및 렌더링
    purchase: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);  
        var loginid = sanitizeHtml(req.session.loginid); 

        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT p.image, p.name, p.brand, p.price, pu.qty, pu.total, pu.date, pu.cancel, pu.purchase_id
                    FROM purchase AS pu
                    JOIN product AS p ON pu.mer_id = p.mer_id
                    WHERE pu.loginid = ?;`;
        var sql3 = `SELECT * FROM code;`;

        db.query(sql1 + sql3, (error, results) => {
            if (error) {
                console.log("Database query error:", error);
                return res.status(500).send("Database query error");
            }

            var boardtype = results[0];
            var codem = results[1];

            db.query(sql2, [loginid], (selectError, purchaseResult) => {
                if (selectError) {
                    console.log("Select query error:", selectError);
                    return res.status(500).send("Select query error");
                }

                var context = {
                    who: name,
                    login: login,
                    body: 'purchase.ejs',
                    cls: cls,
                    boardtype: boardtype,
                    codem: codem,
                    purchase : purchaseResult
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

    purchasecancel: (req, res) => {
        var sntzedPurchaseId = parseInt(sanitizeHtml(req.body.purchase_id));  
        var cancelQuery = 'UPDATE purchase SET cancel = "Y" WHERE purchase_id = ?'; 
    
        db.query(cancelQuery, [sntzedPurchaseId], (error, result) => {
            if (error) {
                console.log('취소 쿼리 오류:', error);
                return res.status(500).send("취소 쿼리 오류");
            }
            

            res.redirect('/purchase');
        });
    },
    
    cartsubmit: (req, res) => {
        var post = req.body;
        var sntzedLoginId = sanitizeHtml(req.session.loginid);
        var sntzedMerId = parseInt(sanitizeHtml(post.mer_id));

    
        // 먼저 동일한 제품이 장바구니에 있는지 확인
        var checkQuery = `SELECT * FROM cart WHERE loginid = ? AND mer_id = ?`;
        db.query(checkQuery, [sntzedLoginId, sntzedMerId], (checkError, results) => {
            if (checkError) {
                console.log("Check query error:", checkError);
                return res.status(500).send("Check query error");
            }
    
            if (results.length > 0) {
                // 이미 장바구니에 있는 경우
                return res.send("<script>alert('장바구니에 이미 있는 제품입니다'); window.location.href='/purchase/cart';</script>");
            } else {
                // 구매 데이터 삽입
                var insertQuery = `INSERT INTO cart (loginid, mer_id, date) VALUES (?, ?, NOW())`;
                db.query(insertQuery, [sntzedLoginId, sntzedMerId], (insertError) => {
                    if (insertError) {
                        console.log("Insert query error:", insertError);
                        return res.status(500).send("Insert query error");
                    }
    
                    // 삽입 후 /purchase로 리다이렉트
                    res.redirect('/purchase/cart');
                });
            }
        });
    },
    

    //cart 매소드 : cart 테이블과 proudct 테이블을 조인해야할듯!

    cart : (req,res) => {
        var { login, name, cls } = authIsOwner(req, res); 
        var loginid = sanitizeHtml(req.session.loginid); 


        var sql1 = `SELECT * FROM boardtype;`;
        var sql2 = `SELECT p.image, p.name, p.brand, p.price, c.date, c.loginid, c.cart_id 
                    FROM cart AS c
                    JOIN product AS p ON c.mer_id = p.mer_id
                    WHERE c.loginid = ?;`;
        var sql3 = `SELECT * FROM code;`;

        db.query(sql1 + sql3, (error, results) => {
            if (error) {
                console.log("Database query error:", error);
                return res.status(500).send("Database query error");
            }

            var boardtype = results[0];
            var codem = results[1];

            db.query(sql2, [loginid], (selectError, cartResult) => {
                if (selectError) {
                    console.log("Select query error:", selectError);
                    return res.status(500).send("Select query error");
                }

                var context = {
                    who: name,
                    login: login,
                    body: 'cart.ejs',
                    cls: cls,
                    boardtype: boardtype,
                    codem: codem,
                    carts : cartResult
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


    cartdelete: (req, res) => {
        const selectedItems = req.body.selectCart;
    
        // 서버 측에서 체크박스가 선택되지 않은 경우를 처리할 필요 없음 (클라이언트 측에서 이미 처리)
        const cartIds = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        const sanitizedCartIds = cartIds.map(id => parseInt(sanitizeHtml(id)));
    
        db.query(`DELETE FROM cart WHERE cart_id IN (?)`, [sanitizedCartIds], (error, result) => {
            if (error) {
                console.log("Delete query error:", error);
                return res.status(500).send("Delete query error");
            }
    
            res.redirect('/purchase/cart');
        });
    },
    

    cartbuy: (req, res) => {
        const selectedItems = req.body.selectCart;
    
        if (!selectedItems) {
            return res.send("<script>alert('구매할 상품을 선택해주세요'); window.location.href='/purchase/cart';</script>");
        }
    
        const cartIds = Array.isArray(selectedItems) ? selectedItems : [selectedItems];
        const sanitizedCartIds = cartIds.map(id => parseInt(sanitizeHtml(id)));
    
        // 선택된 상품들을 purchase 테이블로 이동하고, cart 테이블에서 삭제
        const insertPurchaseQuery = `
            INSERT INTO purchase (loginid, mer_id, date, price, qty, total, payYN, point)
            SELECT c.loginid, c.mer_id, NOW(), p.price, ?, (p.price * ?), 'Y', '0'
            FROM cart AS c
            JOIN product AS p ON c.mer_id = p.mer_id
            WHERE c.cart_id = ?;
        `;
    
        sanitizedCartIds.forEach((cartId, index) => {
            const qty = parseInt(sanitizeHtml(req.body[`qty_${cartId}`]));
    
            db.query(insertPurchaseQuery, [qty, qty, cartId], (insertError) => {
                if (insertError) {
                    console.log("Insert query error:", insertError);
                    return res.status(500).send("Insert query error");
                }
    
                // 삭제 쿼리 실행
                const deleteCartQuery = `DELETE FROM cart WHERE cart_id = ?`;
                db.query(deleteCartQuery, [cartId], (deleteError) => {
                    if (deleteError) {
                        console.log("Delete query error:", deleteError);
                        return res.status(500).send("Delete query error");
                    }
                });
            });
        });
    
        res.redirect('/purchase');
    }
    
    
    
    

    
    
    

}