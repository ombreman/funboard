const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');
app.use('/public', express.static('public'));
const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// const { get } = require('mongoose'); // ???? 이거 언제적음???

let db;
MongoClient.connect('mongodb+srv://jcg3417:1q2w3e4r@cluster0.8pzke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (error, client) => {
    if (error) return console.log(error);
    db = client.db('todoapp');

    app.listen(8080, () => {
        console.log('listening on 8080')
    });
});

app.get('/', (req, res) => {
    res.render('index.ejs');
});

app.get('/write', (req, res) => {
    res.render('write.ejs');
});

// CREATE
app.post('/add', (req, res) => {
    db.collection('counter').findOne({ name: 'postNumber' }, (error, result) => {
        let numberOfPost = result.totalPost;
        db.collection('post').insertOne({ _id: numberOfPost + 1, title: req.body.title, content: req.body.content }, (error, result) => {
            db.collection('counter').updateOne({ name: 'postNumber' }, { $inc: { totalPost: 1 } }, (error, result) => {
                if (error) {return console.log('에러입니다!')};
                res.send('<h1>게시글이 저장되었습니다!</h1>');
            });
        });
    });
});

// READ
app.get('/list', (req, res) => {
    db.collection('post').find().toArray((error, result) => {
        res.render('list.ejs', { posts: result });
    });
});

app.get('/search', (req, res) => {
    console.log(req.query.value);
    db.collection('post').find({ title: req.query.value }).toArray((error, result) => {
        console.log(result);
        res.render('search.ejs', { posts: result });
});


// UPDATE
app.put('/edit', (req, res) => {
    db.collection('post').updateOne({ _id: parseInt(req.body.id)}, { $set: { title: req.body.title, content: req.body.content }}, (error, result) => {
        console.log('수정완료!');
        res.redirect('/list');
    });
});

// DELETE
app.delete('/delete', (req, res) => {
    console.log(req.body);
    req.body._id = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, (error, result) => {
        console.log('게시글 삭제완료')
        res.status(200).send({ message: '얏호! 성공!' });
    });
});

// Detail Page
app.get('/detail/:id', (req, res) => {
    db.collection('post').findOne({ _id: parseInt(req.params.id)}, (error, result) => {
        res.render('detail.ejs', { data: result });
    });
});

// Edit Page
app.get('/edit/:id', (req, res) => {
    db.collection('post').findOne({ _id: parseInt(req.params.id)}, (error, result) => {
        console.log(result);
        res.render('edit.ejs', { post: result });
    });
});

const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session =require('express-session');

app.use(session({secret: '비밀코드', resave: true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/login', (req, res) => {
    res.render('login.ejs');
});

app.post('/login', passport.authenticate('local', { failureRedirect: '/fail' }), (req, res) => {
    res.redirect('/');
});

app.get('/mypage', 로그인했니, (req, res) => {
    connsole.log(req.user);
    res.render('mypage.ejs', { user: req.user })
});

function 로그인했니(req, res, next) {
    if (req.user) {
        next();
    } else {
        res.send('로그인 안하셨는데요?')
    }
};

passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
}, function (입력한아이디, 입력한비번, done) {
    //console.log(입력한아이디, 입력한비번);
    db.collection('login').findOne({ id: 입력한아이디 }, function (에러, 결과) {
        if (에러) return done(에러)

        if (!결과) return done(null, false, { message: '존재하지않는 아이디요' })
        if (입력한비번 == 결과.pw) {
            return done(null, 결과)
        } else {
            return done(null, false, { message: '비번틀렸어요' })
        }
    })
}));

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    db.collection('login').findOne({ id: 아이디 }, (error, result) => {
        done(null, result);
    })
});