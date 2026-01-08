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

    typeview : (req,res)=>{
        var{login,name,cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1+sql2, (error,results) => {

            var context = {
                login : login,
                who : name,
                cls : cls,
                body : 'boardtype.ejs',
                boardtype : results[0],
                codem : results[1]     
            }
            
            res.render('mainFrame',context,(err,html)=>{
                res.end(html);
            })
        } )
    },

    typecreate : (req,res) => {
        
        var{login,name,cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1+sql2, (error,results) => {

            var context = {
                login : login,
                who : name,
                cls : cls,
                body : 'boardtypeCU.ejs',
                boardtype : results[0],
                codem : results[1], 
                actionType : 'create'
            }
            
            res.render('mainFrame',context,(err,html)=>{
                res.end(html);
            })
        } )

    },

    
    typecreate_process : (req,res) =>{

        var post = req.body;
    

        //var sanitizedTypeId = parseInt(sanitizeHtml(post.type_id));
        var sanitizedTitle = sanitizeHtml(post.title);
        var sanitizedDescription = sanitizeHtml(post.description);
        var sanitizedNumPerPage  = parseInt(sanitizeHtml(post.numPerPage));
        var santizedWrite_YN = sanitizeHtml(post.write_YN);
        var santizedRe_YN = sanitizeHtml(post.re_YN);


  
        db.query('INSERT INTO boardtype (title, description, numPerPage, write_YN, re_YN) VALUES (?, ?, ?, ?, ?)',
            [sanitizedTitle, sanitizedDescription, sanitizedNumPerPage, santizedWrite_YN, santizedRe_YN], (error, result) => {
                if (error) {throw error;
                }             
               res.redirect('/board/type/view'); 
            }
        );

    },

    typeupdate : (req,res) => {

        var{login,name,cls} = authIsOwner(req,res)

        var sanitizedId = parseInt(sanitizeHtml(req.params.typeId));

        var sql1 = `select * from boardtype where type_id = ${sanitizedId};`
        var sql2 = `select * from code;`

        db.query(sql1+sql2, (error,results) => {


            var context = {
                login : login,
                who : name,
                cls : cls,
                body : 'boardtypeCU.ejs',
                boardtype : results[0],
                codem : results[1], 
                actionType : 'update'
            }
            
            res.render('mainFrame',context,(err,html)=>{
                res.end(html);
            })
        } )

    },

    typeupdate_process : (req,res) => {

        var post = req.body;
    

        var sanitizedId = parseInt(sanitizeHtml(post.type_id));
        var sanitizedTitle = sanitizeHtml(post.title);
        var sanitizedDescription = sanitizeHtml(post.description);
        var sanitizedNumPerPage  = parseInt(sanitizeHtml(post.numPerPage));
        var santizedWrite_YN = sanitizeHtml(post.write_YN);
        var santizedRe_YN = sanitizeHtml(post.re_YN);


  
        db.query('UPDATE boardtype SET title = ?, description = ?, numPerPage = ?, write_YN = ?, re_YN = ? where type_id = ?' ,
            [sanitizedTitle, sanitizedDescription, sanitizedNumPerPage, santizedWrite_YN, santizedRe_YN, sanitizedId], (error, result) => {
                if (error) {throw error;
                }             
               res.redirect('/board/type/view'); 
            }
        );
    },

    typedelete_process : (req,res) => {
        var id = req.params.typeId;
  
        db.query('DELETE FROM boardtype where type_id = ?' ,
            [id], (error, result) => {
                if (error) {throw error;}             
               res.redirect('/board/type/view'); 
            }
        );

    },



    //===================================================================================================================================================


    view : (req,res) => {

        var{login,name,cls} = authIsOwner(req,res)

        var sntzedTypeId = parseInt(sanitizeHtml(req.params.typeId));
        var pNum = req.params.pNum;

        req.session.pNum = pNum;

        var sql1 = `select * from boardtype;` //results[0]
        var sql2 = `select * from boardtype where type_id = ${sntzedTypeId};` //results[1]
        var sql3 = `select count(*) as total from board where type_id = ${sntzedTypeId};` //results[2]
        var sql4 = `select * from code;` // results[3]
        db.query(sql1+sql2+sql3+sql4, (error,results) => {

            if (error) {
                console.log("Query Error:", error);
                return;
            }

            var numPerPage = results[1][0].numPerPage;
            var offs = (pNum-1)*numPerPage;
            var totalPages = Math.ceil(results[2][0].total / numPerPage);

            db.query(`select b.board_id as board_id, b.title as title, b.date as date, p.name as name
                        from board b inner join person p on b.loginid=p.loginid
                        where b.type_id = ? and b.p_id = ? ORDER BY date desc, board_id desc LIMIT ? OFFSET ?`,
                        [sntzedTypeId, 0, numPerPage, offs], (err, boards) =>{

                            if (err) {
                                console.log("Query Error:", err);
                                return;
                            }
                            
                            var context = {
                                login : login,
                                who : name,
                                cls : cls,
                                body : 'board.ejs',
                                boardtype : results[0],
                                boards : boards,
                                btname : results[1],
                                totalPages : totalPages,
                                pNum : pNum,
                                codem : results[3]
                            }
                            
                            res.render('mainFrame',context,(err,html)=>{
                                if (err) {
                                    console.log("Render Error:", err);
                                }
                
                                res.end(html);
                            })
                        })

        } )

    },

    create: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);  
    
        var sntzedTypeId = parseInt(sanitizeHtml(req.params.typeId));
        var pNum = req.session.pNum;  
    
        var sql1 = `select * from boardtype;`;
        var sql2 = `select * from boardtype where type_id = ${sntzedTypeId};`;
        var sql3 = `select * from code;`

        db.query(sql1 + sql2 + sql3, (error, results) => {
            if (error) {
                console.log("Error:", error);
                res.status(500).send("Database query error");
                return;
            }
    
            var names = [{ name: name }];
    
            var context = {
                login: login,
                who: name,
                cls: cls,
                body: 'boardCRU.ejs',
                boardtype: results[0],
                boards: results[1],
                actionType: 'create',
                pNum: pNum,
                names: names, 
                codem : results[2]
            };
    
            res.render('mainFrame', context, (err, html) => {
                if (err) {
                    console.log("Render error:", err);
                    res.status(500).send("Template render error");
                    return;
                }
                res.end(html);
            });
        });
    },
    

    create_process: (req, res) => {

        var sanitizedTitle = sanitizeHtml(req.body.title);    
        var sanitizedContent = sanitizeHtml(req.body.content); 
        var sanitizedPassword = sanitizeHtml(req.body.password); 
        var sntzedTypeId = parseInt(sanitizeHtml(req.body.type_id));   
    
        var loginid = req.session.loginid; 
    
        var pNum = req.session.pNum;

        var sql2 = `INSERT INTO board (title, content, password, loginid, type_id, date, p_id) 
                        VALUES (?, ?, ?, ?, ?, NOW(), ?);`;
    
        db.query(sql2, [sanitizedTitle, sanitizedContent, sanitizedPassword, loginid, sntzedTypeId, 0], (err, results) => {

            res.redirect(`/board/view/${sntzedTypeId}/${pNum}`);
        });

    },
    
    detail: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);
        var pNum = req.session.pNum;
        var sntzedBoardId = parseInt(sanitizeHtml(req.params.boardId));
    
        // 기존 `sql1`을 통해 board 데이터 조회
        var sql1 = `select * from board where board_id = ${sntzedBoardId};`;
        
        db.query(sql1, (error, result) => {
            if (error || result.length === 0) {
                console.log("Error or no results:", error);
                res.status(500).send("Database query error or board not found");
                return;
            }
            
            var sntzedTypeId = result[0].type_id;
    
            // `boardtype` 테이블과 작성자 정보를 조회하는 추가 SQL 쿼리
            var sql2 = `select * from boardtype;`;
            var sql3 = `select * from boardtype where type_id = ${sntzedTypeId};`;
            var sqlAuthor = `
                select name 
                from person 
                where loginid = '${result[0].loginid}';
            `;
            var sql4 = `select * from code;`
    
            // sql2, sql3, sqlAuthor를 함께 실행
            db.query(sql2 + sql3 + sqlAuthor + sql4, (error, results) => {
                if (error) {
                    console.log("Error:", error);
                    res.status(500).send("Database query error");
                    return;
                }
    
                var context = {
                    login: login,
                    who: name,
                    cls: cls,
                    body: 'boardCRU.ejs',
                    boardtype: results[0],
                    boards: results[1],
                    board: result,
                    actionType: 'detail',
                    pNum: pNum,
                    codem : results[3],
                    names: [{ name: results[2][0].name }] // 작성자 이름을 배열 형태로 전달
                };
    
                res.render('mainFrame', context, (err, html) => {
                    if (err) {
                        console.log("Render error:", err);
                        res.status(500).send("Template render error");
                        return;
                    }
                    res.end(html);
                });
            });
        });
    },

       
    
    update: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);
        var pNum = req.session.pNum;
        var sntzedBoardId = parseInt(sanitizeHtml(req.params.boardId));
    
        // 기존 `sql1`을 통해 board 데이터 조회
        var sql1 = `select * from board where board_id = ${sntzedBoardId};`;
    
        db.query(sql1, (error, result) => {
            if (error || result.length === 0) {
                console.log("Error or no results:", error);
                res.status(500).send("Database query error or board not found");
                return;
            }
    
            var sntzedTypeId = result[0].type_id;
    
            // `boardtype` 테이블과 작성자 정보를 조회하는 추가 SQL 쿼리
            var sql2 = `select * from boardtype;`;
            var sql3 = `select * from boardtype where type_id = ${sntzedTypeId};`;
            var sqlAuthor = `
                select name 
                from person 
                where loginid = '${result[0].loginid}';
            `;
            var sql4 = `select * from code;`
    
            // sql2, sql3, sqlAuthor를 함께 실행
            db.query(sql2 + sql3 + sqlAuthor + sql4, (error, results) => {
                if (error) {
                    console.log("Error:", error);
                    res.status(500).send("Database query error");
                    return;
                }
    
                var context = {
                    login: login,
                    who: name,
                    cls: cls,
                    body: 'boardCRU.ejs',
                    boardtype: results[0],
                    boards: results[1],
                    board: result,
                    actionType: 'update',
                    pNum: pNum,
                    codem : results[3],
                    names: [{ name: results[2][0].name }] // 작성자 이름을 배열 형태로 전달
                };
    
                res.render('mainFrame', context, (err, html) => {
                    if (err) {
                        console.log("Render error:", err);
                        res.status(500).send("Template render error");
                        return;
                    }
                    res.end(html);
                });
            });
        });
    },

    
    update_process: (req, res) => {
        var sanitizedTitle = sanitizeHtml(req.body.title);    
        var sanitizedContent = sanitizeHtml(req.body.content); 
        var sanitizedPassword = sanitizeHtml(req.body.password); 
        var sanitizedTypeId = sanitizeHtml(req.body.type_id);   
        var sanitizedBoardId = parseInt(sanitizeHtml(req.body.board_id));
        var pNum = req.session.pNum;
        var cls = req.session.cls; // 관리자 구분 값
    
        // 관리자일 경우 비밀번호 확인을 건너뛰고 바로 수정 처리
        if (cls === 'MNG') {
            // 비밀번호 검증을 생략하고 바로 게시글 업데이트
            var sql3 = `UPDATE board SET title = ?, content = ?, date = NOW() WHERE board_id = ?;`;
    
            db.query(sql3, [sanitizedTitle, sanitizedContent, sanitizedBoardId], (err, results) => {
                if (err) {
                    console.error("DB 오류:", err);
                    res.status(500).send("데이터베이스 오류");
                    return;
                }
                // 수정 후 게시글 상세 페이지로 리디렉션
                res.redirect(`/board/view/${sanitizedTypeId}/${pNum}`);
            });
    
        } else {
            // 비밀번호 확인을 위한 데이터베이스 조회
            var sql1 = `SELECT password FROM board WHERE board_id = ?;`;
    
            db.query(sql1, [sanitizedBoardId], (err, result) => {
                if (err) {
                    console.error("DB 오류:", err);
                    res.status(500).send("데이터베이스 오류");
                    return;
                }
    
                var storedPassword = result[0].password;
    
                // 제출된 비밀번호와 저장된 비밀번호 비교
                if (storedPassword !== sanitizedPassword) {
                    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
                    res.end(`<script language="JavaScript" type="text/javascript">
                                alert("비밀번호가 일치하지 않습니다.");
                                setTimeout(function() {
                                    location.href = 'http://localhost:3000/board/update/${sanitizedBoardId}/${sanitizedTypeId}/${pNum}';
                                }, 1000);
                            </script>`);
                    return;
                }
    
                // 비밀번호가 일치하고 게시글 수정 가능 시 업데이트 쿼리 실행
                var sql3 = `UPDATE board SET title = ?, content = ?, password = ?, date = NOW() WHERE board_id = ?;`;
    
                db.query(sql3, [sanitizedTitle, sanitizedContent, sanitizedPassword, sanitizedBoardId], (err, results) => {
                    if (err) {
                        console.error("DB 오류:", err);
                        res.status(500).send("데이터베이스 오류");
                        return;
                    }
                    // 수정 후 게시글 상세 페이지로 리디렉션
                    res.redirect(`/board/view/${sanitizedTypeId}/${pNum}`);
                });
            });
        }
    },
    
    delete_process: (req, res) => {

        var sanitizedBoardId = parseInt(sanitizeHtml(req.params.boardId)); 
        var sanitizedTypeId = sanitizeHtml(req.params.typeId);  
        var pNum = sanitizeHtml(req.params.pNum); 
    
        // 게시글 삭제 쿼리
        db.query(`DELETE FROM board WHERE board_id = ?`, 
            [sanitizedBoardId], (error, result) => {
                if (error) {throw error;}

                res.redirect(`/board/view/${sanitizedTypeId}/${pNum}`);
            }
        );
    }
    


}