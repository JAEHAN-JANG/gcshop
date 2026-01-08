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

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from person;`
        var sql3 = `select * from code;`

        db.query(sql1+sql2+sql3, (error,results) => {

            var context = {
                who : name,
                login : login,
                body : 'person.ejs',
                cls : cls,
                boardtype : results[0],
                person : results[1],
                codem : results[2],
            };

            req.app.render('mainFrame',context,(err,html)=>{
                res.end(html)
            });
        })
    },

    create : (req,res) => {
        var{login,name,cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1+sql2,(error,results)=>{
            var context = {
                who : name,
                login : login,
                body : 'personCU.ejs',
                cls : cls,
                person : null,
                isCreate : true,
                boardtype : results[0],
                codem : results[1]
            };
    
            req.app.render('mainFrame',context,(err,html)=>{
                res.end(html);
            });
        })
 
    },

    create_process : (req,res) => {

        var post = req.body;
    

        var sanitizedLoginId = sanitizeHtml(post.loginid);
        var sanitizedPassWord = sanitizeHtml(post.password);
        var sanitizedName = sanitizeHtml(post.name);
        var sanitizedAddress = sanitizeHtml(post.address);
        var sanitizedTel = sanitizeHtml(post.tel);
        var sanitizedBirth = sanitizeHtml(post.birth);

        var sanitizedClass = sanitizeHtml(post.class);
        var sanitizedGrade = sanitizeHtml(post.grade);
    
  
        db.query('INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [sanitizedLoginId, sanitizedPassWord, sanitizedName, sanitizedAddress, sanitizedTel, sanitizedBirth, sanitizedClass, sanitizedGrade], (error, result) => {
                if (error) {throw error;
                }             
                res.redirect('/person/view'); 
            }
        );

    },

    update : (req,res) => {
        var{login,name,cls} = authIsOwner(req,res)

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`
        
        db.query(sql1+sql2,(error1,bresults)=>{
            
            if(error1) { throw error1; }

            var sanitizedLoginId = sanitizeHtml(req.params.loginid);
        

            db.query('select * from person where loginid = ?', [sanitizedLoginId], (error,results)=>{
    
                var context = {
                    who : name,
                    login : login,
                    body : 'personCU.ejs',
                    cls : cls,
                    person : results,
                    boardtype : bresults[0],
                    codem : bresults[1] 
                };
        
                req.app.render('mainFrame',context,(err,html)=>{
                    res.end(html)
                });
            }) 

        })



    },

    update_process: (req, res) => {
        var post = req.body;
        var sanitizedLoginId = sanitizeHtml(req.body.loginid); 
 
        var sanitizedPassWord = sanitizeHtml(post.password);
        var sanitizedName = sanitizeHtml(post.name);
        var sanitizedAddress = sanitizeHtml(post.address);
        var sanitizedTel = sanitizeHtml(post.tel);
        var sanitizedBirth = sanitizeHtml(post.birth);
        var sanitizedClass = sanitizeHtml(post.class);
        var sanitizedGrade = sanitizeHtml(post.grade);
    
        db.query(
            'UPDATE person SET password = ?, name = ?, address = ?, tel = ?, birth = ?, class = ?, grade = ? WHERE loginid = ?',
            [sanitizedPassWord, sanitizedName, sanitizedAddress, sanitizedTel, sanitizedBirth, sanitizedClass, sanitizedGrade, sanitizedLoginId],
            (error, result) => {
                res.redirect('/person/view');  
            }
        );
    },
    

    delete_process : (req,res) => {

        var sanitizedLoginId = sanitizeHtml(req.params.loginid);
    
        db.query(`DELETE FROM person WHERE loginid = ?`, 
            [sanitizedLoginId], (error, result) => {
                if (error) {
                    throw error;
                }
    
                res.redirect('/person/view'); 
            }
        );
        
    }

}