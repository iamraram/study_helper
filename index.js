const express = require("express");
const app = express();
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');

var db;

MongoClient.connect('mongodb+srv://slyram06:lee146906@cluster0.fzore.mongodb.net/Cluster0?retryWrites=true&w=majority', function (err, client) {

    if (err) {
        return console.log(err)
    };

    db = client.db('studyhelper');

    app.listen(process.env.PORT || 3000, () =>
        console.log('서버 연결 완료')
    );

});

app.use(express.static('public'));
app.use(session({
    secret: '비밀코드',
    resave: 'true',
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

app.get("/login", (req, res) => {
    res.render('../login.ejs');
});

app.get("/signup", (req, res) => {
    res.render('../signup.ejs');
});

app.get("/mainpage", (req, res) => {
    res.render('../mainpage.ejs');
});

app.get("/", (req, res) => {
    res.render('../main.ejs');
});

app.get("/fail", (req, res) => {
    res.render('../login_fail.ejs');
});

app.post('/add', function (req, res) {
    db.collection('user_amount').findOne({ name: '유저 수' },

        function (err, result) {
            var total = result.TotalUser;

            db.collection('login').insertOne({
                _id: total + 1,
                user_id: req.body.id,
                user_pw: req.body.pw,
                user_nickname: req.body.nickname,
            },

            function (err, result) {
                db.collection('user_amount').updateOne(
                    { name: '유저 수' },
                    { $inc: { TotalUser: 1 } },
                )
            });

        });

    res.sendFile(__dirname + '/add.html');
});

app.post("/login", passport.authenticate('local', { failureRedirect: '/fail' }),
    function (res, req) {
        req.redirect('/')
    });

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
},
    function (written_id, written_pw, done) {
        console.log(written_id, written_pw)
        db.collection('login').findOne({
            id: written_id
        },
            function (err, result) {
                if (err) return done(err)

                if (!result) return done(null, false, {
                    message: '존재하지 않는 아이디입니다.'
                })
                if (written_pw == result.pw) {
                    return done(null, result)
                }
                else {
                    return done(null, false, {
                        message: '비밀번호가 틀렸습니다.'
                    })
                }
            }
        )
    })
);

passport.serializeUser(function (user, done) {
    done(null, user.id)
});

passport.deserializeUser(function (아이디, done) {
    done(null, {})
}); 
