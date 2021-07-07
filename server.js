const express = require('express');
const app = express();
const bodyParser = require('body-parser');
app.use(express.urlencoded({ extended: true }));
const MongoClient = require('mongodb').MongoClient;
app.set('view engine', 'ejs');

const { get } = require('mongoose'); // ???? 이거 언제적음???

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
    res.send('전송완료')
    db.collection('counter').findOne({ name: 'postNumber' }, function(err, result){
        console.log(result.totalPost);
        let numberOfPosts = result.totalPost

        db.collection('post').insertOne({ _id: numberOfPosts, date: req.body.date, title: req.body.title }, (error, result) => {
            console.log('저장완료');
    });
});

app.get('/list', (req, res) => {
    db.collection('post').find().toArray(function (error, result){
        console.log(result);
        res.render('list.ejs', { posts: result });
    });
});