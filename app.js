const express = require("express");
const mysql = require("mysql");
const app = express();
const port = 9000;
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));
app.use(express.json());

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'qwer1234',
    database: 'node_db',
});

app.use(session({
    secret: 'mykey',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));

//회원가입
app.get('/register', (req, res) => {
    console.log('회원가입 페이지');
    res.render('register');
});

app.post('/register', (req, res) => {
    console.log('회원가입 하는 중')
    const body = req.body;
    const id = body.id;
    const pw = body.pw;
    const name = body.name;
    const age = body.age;

    con.query('select * from users where id=?', [id], (err, data) => {
        if (data.length === 0) {
            console.log('회원가입 성공');
            con.query('insert into users(id, pw, name, age) values(?,?,?,?)', [id, pw, name, age]);
            res.send('<script>alert("회원가입 성공"); location.href="/" </script> ');
        }
        else {
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패!!() 동일한 정보가 존재합니다.)"); location.href="/register" </script>');
        }
    });
});

app.get('/login', (req, res) => {
    console.log('로그인 작동');
    res.render('login');
})

app.post('/login', (req, res) => {
    const body = req.body;
    const id = body.id;
    const pw = body.pw;

    con.query('select * from users where id =?', [id], (err, data) => {
        console.log(data[0]);
        console.log(id);
        console.log(data[0].id);
        console.log(data[0].pw);
        console.log(id == data[0].id);
        console.log(pw == data[0].pw);

        if (id == data[0].id && pw == data[0].pw) {
            console.log('로그인 성공');
            req.session.is_logined = true;
            req.session.name = data.name;
            req.session.id = data.id;
            req.session.pw = data.pw;
            req.session.save(function () {
                res.render('index', {
                    name: data[0].name,
                    id: data[0].id,
                    age: data[0].age,
                    is_logined: true
                });
            });
        } else {
            console.log('로그인 실패');
            res.render('login');
        }
    });
});

app.get('/logout', (req, res) => {
    console.log('로그아웃 성공');
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});

app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 대기 중입니다.`)
});