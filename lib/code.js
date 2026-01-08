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

    view : (req,res) =>{
        var{login,name,cls} = authIsOwner(req,res)
        
        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        db.query(sql1+sql2,(error,results) => {
           
            var context = {
                who : name,
                login : login,
                body : 'code.ejs',
                cls : cls,

                boardtype : results[0],

                codem : results[1],

                codes : results[1]
           };

           req.app.render('mainFrame',context,(err,html)=> {
                res.end(html);
           })

            
        })

    },

    create : (req,res)=>{
        var{login,name,cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1+sql2,(error,results)=>{
            
            var context = {
                who : name,
                login : login,
                body : 'codeCU.ejs',
                cls : cls, 
                boardtype : results[0],
                codem : results[1], 
                code : null // code를 빈 객체로 전달하여 undefined 방지 codeCU에서 코드 입력과 수정을 구분하기 위함
            };
            res.render('mainFrame',context,(err,html)=>{
                res.end(html)
            });

        })
    },

    create_process: (req, res) => {
        var post = req.body;
    

        var sanitizedMainId = sanitizeHtml(post.main_id);
        var sanitizedMainName = sanitizeHtml(post.main_name);
        var sanitizedSubId = sanitizeHtml(post.sub_id);
        var sanitizedSubName = sanitizeHtml(post.sub_name);
        var sanitizedStart = sanitizeHtml(post.start);
        var sanitizedEnd = sanitizeHtml(post.end);
    
  
        db.query('INSERT INTO code (main_id, main_name, sub_id, sub_name, start, end) VALUES (?, ?, ?, ?, ?, ?)',
            [sanitizedMainId, sanitizedMainName, sanitizedSubId, sanitizedSubName, sanitizedStart, sanitizedEnd], (error, result) => {
                if (error) {throw error;
                }             
                res.redirect('/code/view'); 
            }
        );
    },

    update: (req, res) => {
        var { login, name, cls } = authIsOwner(req, res);
        db.query('SELECT * FROM code',(error2,cresults)=>{
            
            if(error2){throw error2;}

            
            db.query('SELECT * FROM boardtype',(error1,bresults)=>{
                if (error1) {throw error1;}

                var sanitizedMainId = sanitizeHtml(req.params.main_id);
                var sanitizedSubId = sanitizeHtml(req.params.sub_id);
                var sanitizedStart = sanitizeHtml(req.params.start);
                var sanitizedEnd = sanitizeHtml(req.params.end);
            
           
                db.query(
                    'SELECT * FROM code WHERE main_id = ? AND sub_id = ? AND start = ? AND end = ?',
                    [sanitizedMainId, sanitizedSubId , sanitizedStart, sanitizedEnd],
                    (error, results) => {
                        if (error) {
                            throw error;
                        }
        
                        var context = {
                            who: name,
                            login: login,
                            body: 'codeCU.ejs', 
                            cls: cls,
                            code: results[0],
                            boardtype : bresults,
                            codem : cresults 
                        };
        
                        res.render('mainFrame', context, (err, html) => {
                            res.end(html);
                        });
                    }
                );           
            })
        })

    },


    update_process : (req, res) => {
        var post = req.body;
        var sanitizedMainId = sanitizeHtml(post.main_id);
        var sanitizedMainName = sanitizeHtml(post.main_name);
        var sanitizedSubId = sanitizeHtml(post.sub_id);
        var sanitizedSubName = sanitizeHtml(post.sub_name);
        var sanitizedStart = sanitizeHtml(post.start);
        var sanitizedEnd = sanitizeHtml(post.end);
    
        db.query('UPDATE code SET main_name = ?, sub_name = ?, end = ? WHERE main_id = ? AND sub_id = ? AND start = ?',
            [sanitizedMainName, sanitizedSubName, sanitizedEnd, sanitizedMainId, sanitizedSubId, sanitizedStart], (error, result) => {
                if (error) throw error;
                res.redirect('/code/view');
            });
    },

    

    delete_process: (req, res) => {

        var sanitizedMainId = sanitizeHtml(req.params.main_id);
        var sanitizedSubId = sanitizeHtml(req.params.sub_id);
        var sanitizedStart = sanitizeHtml(req.params.start);
        //var santizedEnd = sanitizeHtml(req.params.end);
    
        db.query(`DELETE FROM code WHERE main_id = ? AND sub_id = ? AND start = ?`, 
            [sanitizedMainId, sanitizedSubId, sanitizedStart], (error, result) => {
                if (error) {
                    throw error;
                }
    
                res.redirect('/code/view'); 
            }
        );
    }
    
    

    
    
}