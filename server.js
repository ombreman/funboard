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