// routes/index.js

module.exports = function(app, mysql, connection)
{

	app.get('/', function(req, res){
		connection.query("select * from books", function(err, books){
			console.log(books);
			books.forEach(function(book){
				// console.log((new Date()).yyyymmdd());
				book.published_date = new Date(book.published_date).yyyymmdd();
				console.log(book.published_date);
			});
			res.render('index', {
				title: "book store",
				books: books,
				result: ""
			});
			// res.status(200).json(books);
		})

	})

	// GET ALL BOOKS
	app.get('/api/books', function(req, res){
		connection.query("select * from books", function(err, books){
			if(err) return res.status(500).send({error:"server error"})
			res.status(200).json(books);
		})
	});

	// GET SINGLE BOOK
	app.get('/api/books/:book_id', function(req, res){
		connection.query("select * from books where book_id = ?", req.params.book_id, function(err, book){
			if(err) return res.status(500).json({error: err});
			if(Object.keys(book).length == 0) return res.status(404).json({error: "book not found"});
			res.json(book);
		})

	})

	// GET BOOK BY AUTHOR
	app.get('/api/books/author/:author', function(req, res){
		connection.query("select * from books where author = ?", req.params.author, function(err, books){
			if(err) return res.status(500).json({error: err});
			if(!books) return res.status(404).json({error: 'book not found'});
			console.log(typeof books);
			res.json(books);
		})
	})

	// FORM FOR ADDING BOOK
	app.get('/books/new', function(req, res){
		res.render('new');
	});

	app.post('/books', function(req, res){

		console.log(req);
		console.log("published_date : " + req.body.published_date);

		var published_date = new Date(req.body.published_date);

		console.log("published_date : " + published_date);

		var book = {title: req.body.title, author: req.body.author, published_date: published_date};

		var query = connection.query("INSERT INTO books SET ?", book, function(err, result){

			if(err){
				console.log(err);
				throw err;
			}
			// res.render("index", {
			// 	// result: book.title + " 추가되었습니다."
			// });
			res.redirect('/');
		});
	});

	// CREATE BOOK
	app.post('/api/books', function(req, res){
		var published_date = new Date(req.body.published_date);
		console.log("published_date : " + published_date);
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

	// DELETE BOOK
	app.delete('/api/books/:book_id', function(req, res){
		connection.query("delete from books where book_id = ?", req.params.book_id, function(err, results){
			if(err) return res.status(500).json({error: 'database err'});
			res.status(204).end();
		})
	});
}

// yyyymmdd 형태로 포매팅된 날짜 반환
Date.prototype.yyyymmdd = function()
{
	// 네자리로 된 년도 숫자 반환->string
    var yyyy = this.getFullYear().toString();

	// 자스 반환값에서 월을 0부터 시작하므로 + 1
    var mm = (this.getMonth() + 1).toString();
    var dd = this.getDate().toString();

	// mm이 10월~12월이 아니면 01월
    return yyyy + (mm[1] ? mm : '0' + mm[0]) + (dd[1] ? dd : '0'+dd[0]);
}
