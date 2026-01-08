var db = require('./db');
var sanitizeHtml = require('sanitize-html')

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
    login : (req,res) => {
        var {name, login, cls} = authIsOwner(req,res);

        var sql1 = `select * from boardtype;`
        var sql2 = `select * from code;`

        db.query(sql1+sql2,(error,results)=>{
            var context = {
                who : name,
                login : login,
                body : 'login.ejs',
                cls : cls,
                boardtype : results[0],
                codem : results[1]
            };
            req.app.render('mainFrame',context,(err,html)=>{
                res.end(html); 
        })
        })

    },

    login_process : (req,res)=>{
        var post = req.body;
        var sntzedLoginid = sanitizeHtml(post.loginid);
        var sntzedPassword = sanitizeHtml(post.password);
        
        db.query('select count(*) as num from person where loginid = ? and password = ?',
        [sntzedLoginid,sntzedPassword],(error, results)=>{
            if (results[0].num === 1){
                db.query('select name, class,loginid, grade from person where loginid = ? and password = ?',
        [sntzedLoginid,sntzedPassword],(error, result)=>{
        
                req.session.is_logined = true;
        
                req.session.loginid = result[0].loginid
        
                req.session.name = result[0].name
        
                req.session.cls = result[0].class
        
                req.session.grade = result[0].grade
        
                res.redirect('/');
            }) 
        }
        else {  req.session.is_logined = false;
                req.session.name = 'Guest';
                req.session.cls = 'NON';
                res.redirect('/');   
        }
        })  },

        logout_process : (req, res) => {
            req.session.destroy((err)=>{
                res.redirect('/');
        })  },

        register : (req,res) => {

            var sql1 = `select * from boardtype;`
            var sql2 = `select * from code;
            `
            db.query(sql1+sql2,(error,results)=>{
                var context = { 
                    who : 'Guest',
                    body : 'personCU.ejs',
                    login : false,
                    cls : 'NON',
                    person : null,
                    isCreate : false,
                    boardtype : results[0],
                    codem : results[1]
                }
                
                req.app.render('mainFrame',context,(err,html)=>{
                    res.end(html); 
                })
            })
        },

        register_process: (req, res) => {
            var post = req.body;
        
            var sanitizedLoginid = sanitizeHtml(post.loginid);
            var sanitizedPassword = sanitizeHtml(post.password);
            var sanitizedName = sanitizeHtml(post.name);
            var sanitizedAddress = sanitizeHtml(post.address);
            var sanitizedTel = sanitizeHtml(post.tel);
            var sanitizedBirth = sanitizeHtml(post.birth);
        
            db.query(
                'INSERT INTO person (loginid, password, name, address, tel, birth, class, grade) VALUES (?, ?, ?, ?, ?, ?, "CST", "S")',
                [sanitizedLoginid, sanitizedPassword, sanitizedName, sanitizedAddress, sanitizedTel, sanitizedBirth],
                (error, result) => {
                    if (error) {
                        throw error;
                    }

                    res.redirect('/'); 
                }
            );
        }
        
        

}