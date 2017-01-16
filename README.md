# RESTful API using MysqlDB & Mysqljs & Express

VELOPERT님의 MongoDB & Mongoose를 mysql로 바꾼 프로젝트입니다.

```
$ npm install
$ node app.js
```

## API 목록

|ROUTE | METHOD | DESCRIPTION|
|:-- | :--:| :--|
|/api/books | GET | 모든 book 조회|
|/api/books/:book_id| GET| id로 book 조회|
|/api/books/author/:author| GET | author 값으로 book 조회|
|/api/books| POST | book 데이터 생성 |
|/api/books/:book_id | PUT | book 데이터 수정 |
|/api/books/:book_id| DELETE| book 데이터 제거|

## 참조

(https://github.com/velopert/mongoose_tutorial)[https://github.com/velopert/mongoose_tutorial]
