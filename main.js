const express = require('express');
var session = require('express-session');
var MySqlStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');

var options = {
    host : 'localhost',
    user :'nodejs',
    password : 'nodejs',
    database : 'webdb2024'
};

var sessionStore =new MySqlStore(options);
const app = express();

app.use(session({
    secret : 'keyboard cat',
    resave : false,
    saveUninitialized : true,
    store : sessionStore
}));

app.set('views',__dirname +'/views');
app.set('view engine','ejs')
app.use(bodyParser.urlencoded({extended: false }));

const rootRouter =require('./router/rootRouter');
const authRouter =require('./router/authRouter');
const codeRouter = require('./router/codeRouter');
const productRouter = require('./router/productRouter');
const personRouter = require('./router/personRouter');
const boardRouter = require('./router/boardRouter');
const purchaseRouter = require('./router/purchaseRouter');

app.use(express.static('public'));

app.use('/',rootRouter);
app.use('/auth',authRouter);
app.use('/code',codeRouter);
app.use('/person',personRouter);
app.use('/product',productRouter);
app.use('/board',boardRouter);
app.use('/purchase',purchaseRouter);

app.get('/favicon.ico', (req,res)=>res.writeHead(404));
app.listen(3000, ()=>console.log('Example app listening on port 3000'))