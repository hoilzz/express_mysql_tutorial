# express + mysqljs로 MySQL과 연동하여 RESTful API 만들기

Velopert님의 (Express와 Mongoose를 통해 MongoDB와 연동하여 RESTful API 만들기)[https://velopert.com/594] 강좌를 참고하였습니다. 이 강좌에서 NoSQL을 사용하고 싶지 않아 MySQL로 바꿔서 적용한 튜토리얼입니다.

## 1. 프로젝트 생성 먼저 하자.

```
npm init --yes
```

## 2. 패키지 설치

```
npm install --save express mysql body-parser
```

1. `express` : 웹 프레임워크. HTTP 유틸리티 메소드 및 미들웨어를 통해 기본 라우팅, API를 빠르게 작성해보자.
2. `body-parser` : 데이터 처리 미들웨어. POST로 온 JSON을 bodyParser 미들웨어로 파싱하고 바디에 반환.
3. `MySQL` : mysql 연동 라이브러리

## 3. 서버 설정하기


### 3.1 dir 구조

```javascript
node_modules
routes
|- - - index.js
app.js
package.json
```

### 3.2 Express를 이용한 웹서버

book_store에서 book 데이터를 조회, 수정, 삭제하는 간단한 `RESTful` 웹서버를 만들어보자.

서버의 메인 파일 app.js를 만들자.


*app.js*

```javascript
// [LOAD PACKAGES]
var express = require('express');
var app	= express();
var bodyParser = require('body-parser');

// [CONFIGURE ROUTER]

connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }
  console.log('connected as id ' + connection.threadId);
});



// [CONFIGURE APP TO USE BodyParser]
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

// [CONFIGURE SERVER PORT]
var port = process.env.PORT || 3000;


// [RUN SERVER]
var server = app.listen(port, function(){
	console.log("Express server has started on port " + port)
});
```

- `app.use(bodyParser.json())`
	- 기본적으로 Express는 요청 바디에 대하여 무엇을 해야할지 모른다. 따라서 Content-Type이 `application/x-www-form-urlencoded`와 `applcation/json` 요청 바디를 파싱해줄 bodyParser 미들웨어를 추가하고 req.body에 파라미터를 배치해야 한다. 이제 `req.body.title`과 같이 접근 가능하다.


## 4 MySQL 연결

*app.js*

```javascript
// ...
var mysql      = require('mysql');
// ...

// [CONFIGURE MySQL]
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
  database : 'book_store'
});

// Establishing Connections
connection.connect(function(err) {
  if (err) {
    console.error('error connecting: ' + err.stack);
    return;
  }

  console.log('connected as id ' + connection.threadId);
});

```

- 주의할점은 `mysql.createConnection` 은 실제 연결을 하지 않는다.
- `connection.connect()` 함수가 실제 연결을 수행한다.


## 5 Schema & Model

Schema는 Document의 구조가 어떻게 생겼는지 알려주는 역할을 한다. Velopert님의 mongo DB 강의에서는 `models/book.js` 안에 Schema를 생성한다. 하지만 `mysqljs`로는 이러한 역할을 할 수 있는게 없어서 쿼리 문으로 직접 작성해보자.

```mysql
create database book_store

use book_store

create table books (
  book_id int not null auto_increment,
  title varchar(255) not null,
  author varchar(255) not null,
  published_date datetime not null default current_timestamp,
  primary key(book_id)
);
```

## 6 CRUD

라우터에서 `mysql`과 `connection`을 사용해야 하므로 app.js에서 라우터에 전달해주자.

*app.js*

```javascript
...
var router = require('./routes')(app, mysql, connection);
```

*routes/index.js*

```javascript
modules.exports = function(app, mysql, connection)
{
  // ..
}
```


### 6.1 Create (POST /api/books)

json 형태로 body에 담아 book을 생성하는 API다.

```javascript
// CREATE BOOK
app.post('/api/books', function(req, res){
  var published_date = new Date(req.body.published_date);
  var book = {title: req.body.title, author: req.body.author, published_date: published_date};
  var query = connection.query("INSERT INTO books SET ?", book, function(err, result){
    if(err){
      console.log(err);
      throw err;
    }
    res.status(200).send("success");
  });
  console.log(query);
});
```

- `connection.query(sqlString, callback)`
  - 가장 기본적인 쿼리 수행 방식이다.

- 첫번째 인자 `sqlString`은 SQL injection attack을 피하기 위해, 유저가 제공한 데이터를 escape해야만 한다. 그 (방식)[https://github.com/mysqljs/mysql#performing-queries]은 다음과 같다.
  - `"SELECT * from users where id = ?", [req.body.userId]`

- 두번째 인자 `callback`함수는 `err`, `results`, `fields` 세가지를 인자로 받는다.
  - `results`는 쿼리의 결과를 object 배열로 갖는다.


### 6.2.1 RETRIEVE (GET /api/books)

모든 book 데이터를 조회하는 API다.

```javascript
// GET ALL BOOKS
app.get('/api/books', function(req, res){
  connection.query("select * from books", function(err, books){
    if(err) return res.status(500).send({error:"server error"})
    res.status(200).json(books);
  })
});
```

- query 수행후 err 발생시 HTTP status 500(server err)과 메세지로 응답한다.

### 6.2.2 RETRIEVE (GET /api/books/:book_id)

DB에서 query parameter의 book_id로 book을 찾는다.

```javascript
// GET SINGLE BOOK
app.get('/api/books/:book_id', function(req, res){
  connection.query("select * from books where book_id = ?", req.params.book_id, function(err, book){
    if(err) return res.status(500).json({error: err});
    if(Object.keys(book).length == 0) return res.status(404).json({error: "book not found"});
    res.json(book);
  })
})
```

- `Object.keys(객체)`를 통해 배열의 길이를 구한다.
  - 만약 길이가 0이면 DB에 없는 id를 가진 book을 조회했으므로 404와 에러메시지로 응답한다.

### 6.3 UPDATE (PUT /api/books/:book_id)

book_id를 가진 book을 body에 담긴 정보를 기준으로 업데이트한다.

```javascript
// UPDATE THE BOOK
app.put('/api/books/:book_id', function(req, res){
  connection.query("select * from books where book_id = ?", req.params.book_id, function(err, books){
    if(err) return res.status(500).json({error: 'database error'});
    if(Object.keys(books).length == 0) return res.status(404).json({error: 'book not found'});


    if(req.body.title) books[0].title = req.body.title;

    if(req.body.author) books[0].author = req.body.author;
    if(req.body.published_date) books[0].published_date = req.body.published_date;

    var query = connection.query("update books set title = ?, author = ?, published_date = ? where book_id = ?", [books[0].title, books[0].author, books[0].published_date, books[0].book_id], function(err){
      if(err) res.status(500).json({error: "failed to update"});
      res.json({message: 'book updated'});
    })
    // console.log(query);
  })
});
```

- 먼저 쿼리 파라미터 `req.params.book_id`를 통해 book을 찾는다.
- if문으로 요청의 body에 값이 있는 존재하는 데이터를 쿼리를 통해 찾는 book.col명 에 업데이트를 한다.


## 6.4 DELETE

```javascript
// DELETE BOOK
app.delete('/api/books/:book_id', function(req, res){
  connection.query("delete from books where book_id = ?", req.params.book_id, function(err, results){
    if(err) return res.status(500).json({error: 'database err'});
    res.status(204).end();
  })
});
```

- DELETE는 idempotent하다. (어떤 과정을 반복 수행 하여도 결과가 동일함)
- 그러므로 요청한 작업을 수행하였고 데이터를 반환 할 필요가 없다는 것을 의미하는 204 HTTP status(`No Content`)로 응답한다.



## Summary

**실수한 것들**

1. alter table book modify published_date datetime not null default current_timestamp;


2. TypeError: connection.query is not a function
-> connection.connect


3. json 보낼떄 ""여야 할까 왜 ''게 아니라


4. new Date할 때 실제로 있는 날짜만 됨
2016-02-33일 로 new date하면 안됨


5. alter table mytable modify column addr varchar(100) not null;

 not null, auto_increment 추가하려면

 칼럼명 타입 not null auto_increment 이런 순서지켜야함


6. object empty 여부 확인하기
Object.keys(k).length
: returns an array of a given object's own enumerable properties


7. Getting the number of affected rows

You can get the number of affected rows from an insert, update or delete statement.

connection.query('DELETE FROM posts WHERE title = "wrong"', function (error, results, fields) {
  if (error) throw error;
  console.log('deleted ' + result.affectedRows + ' rows');
})

이 강좌의 모든 소스코드는 여기에 있습니다.

## 참조

(https://velopert.com/594)[https://velopert.com/594]
(http://bcho.tistory.com/892)[http://bcho.tistory.com/892]
