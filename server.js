const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

// const { get } = require('mongoose'); // ???? 이거 언제적음???

var db;
MongoClient.connect('mongodb+srv://jcg3417:1q2w3e4r@cluster0.8pzke.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', (error, client) => {
    if (error) return console.log(error);
    db = client.db('todoapp');

    app.listen(8080, () => {
        console.log('listening on 8080')
    });
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.get('/write', (req, res) => {
    res.sendFile(__dirname + '/write.html')
});

app.post('/add', (req, res) => {
    db.collection('counter').findOne({ name: 'postNumber' }, (error, result) => {
        console.log(result.totalPost);
        let numberOfPost = result.totalPost;
        db.collection('post').insertOne({ _id: numberOfPost + 1, date: req.body.date, title: req.body.title }, (error, result) => {
            console.log('저장완료');
            db.collection('counter').updateOne({ name: 'postNumber' }, { $inc: { totalPost: 1 } }, (error, result) => {
                if (error) {return console.log('에러입니다!')};
                res.send('전송완료');
            });
        });
    });
});

app.get('/list', (req, res) => {
    db.collection('post').find().toArray((error, result) => {
        res.render('list.ejs', { posts: result });
    });
});

app.delete('/delete', (req, res) => {
    console.log(req.body)
    req.body = parseInt(req.body._id);
    db.collection('post').deleteOne(req.body, (error, result) => {
        console.log('게시글 삭제완료')
        req.status(200).send({ message: '얏호! 성공!' });
    });
});