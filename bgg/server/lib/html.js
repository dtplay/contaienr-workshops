const { join } = require('path');
const hbs = require('express-handlebars');
const express = require('express');

const f = function(app, bggdb, bootstrap) {

	this.router = express.Router();

	app.engine('hbs', hbs());
	app.set('view engine', 'hbs')

	app.set('views', join(__dirname, '..', 
		bootstrap? 'bootstrap_views': 'views')
	);

	this.router.get('/search', (req, resp) => {

		const limit = parseInt(req.query.limit) || 20;
		const offset = parseInt(req.query.offset) || 0;

		bggdb.findGameByName([`%${req.query.q}%`, limit, offset])
			.then(result => {
				resp.type('text/html');
				try {
					resp.status(200)
					resp.render('games', {
						layout: false,
						searchTerm: req.query.q,
						games: result
					})
				} catch (err) { throw err; }
			})
			.catch(err => {
				resp.status(500);
				resp.render('error', {
					layout: false,
					error: err
				});
			})
	});

	this.router.get('/game/:gid', (req, resp) => {

		const limit = parseInt(req.query.limit) || 20;
		const offset = parseInt(req.query.offset) || 0;

		Promise.all([
			bggdb.findGameDetailsByGid([ req.params.gid ]),
			bggdb.findCommentDetailsByGid([ req.params.gid, limit, offset ]),
			bggdb.countCommentsByGid([ req.params.gid ]),
		]).then(result => {
			resp.status(200);
			resp.type('text/html')
			resp.render('game_comments', {
				layout: false,
				game: result[0][0],
				comments: result[1],
				total_comments: result[2][0].comment_cnt,
				limit: (result[2][0].comment_cnt > limit)? limit: result[2][0].comment_cnt
			})
		}).catch(err => {
			resp.status(500);
			resp.render('error', {
				layout: false,
				error: err
			});
		})

	});

	app.get(/.*/, express.static(join(__dirname, '..',
		bootstrap? 'bootstrap_public': 'public'))
	);

	return (this.router);
}

module.exports = function(app, bggdb, bootstrap) {
	return (new f(app, bggdb, !!bootstrap));
}
