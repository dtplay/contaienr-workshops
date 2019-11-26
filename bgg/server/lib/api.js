const cors = require('cors')
const express = require('express');

const f = function(app, bggdb) {

	this.subApp = express();

	this.subApp.use(cors());
	this.subApp.use(express.json());

	this.subApp.get('/search', (req, resp) => {

		const limit = parseInt(req.query.limit) || 20;
		const offset = parseInt(req.query.offset) || 0;


		bggdb.findGameByName([ `%${req.query.q}%`, limit, offset ])
			.then(result => {
				if (result.length) {
					resp.status(200);
					return resp.json(result.map(v => `${this.subApp.mountpath}/game/${v.gid}`))
				}

				resp.status(404)
				resp.json({ error: `not found: ${req.query.q}` })
			})
			.catch(err => {
				resp.status(500)
				resp.json({ error: err })
			})
	})

	this.subApp.get('/game/:gid', (req, resp) => {
		bggdb.findGameDetailsByGid([ parseInt(req.params.gid) ])
			.then(result => {
				if (result.length) {
					resp.status(200)
					return resp.json({
						...result[0],
						comments: `${this.subApp.mountpath}/game/${req.params.gid}/comments`
					});
				}

				resp.status(404)
				resp.json({ error: `Game not found: ${err}` })
			})
			.catch(err => {
				resp.status(500)
				resp.json({ error: err })
			})
	})

	this.subApp.get('/game/:gid/comments', (req, resp) => {

		const limit = parseInt(req.query.limit) || 20;
		const offset = parseInt(req.query.offset) || 0;
		const gid = parseInt(req.params.gid)

		Promise.all([
			bggdb.findCommentsByGid([ gid, limit, offset ]),
			bggdb.countCommentsByGid([ gid ])
		]).then(result => {
			resp.status(200)
			resp.json({
				game: `${this.subApp.mountpath}/game/${gid}`,
				total: result[1][0].comment_cnt,
				offset: offset,
				limit: limit,
				comments: result[0].map(v => `${this.subApp.mountpath}/comment/${v.c_id}`)
			})
		}).catch(err => {
			resp.status(500)
			resp.json({ error: err })
		})
	})

	this.subApp.get('/comment/:cid', (req, resp) => {
		bggdb.findCommentsByCid([ req.params.cid ])
			.then(result => {
				if (result.length) {
					resp.status(200);
					return resp.json({
						c_id: result[0].c_id,
						user: result[0].user,
						rating: result[0].rating, 
						c_text: result[0].c_text,
						game: `${this.subApp.mountpath}/game/${result[0].gid}`
					})
				}

				resp.status(404)
				resp.json({ error: `Comment not found: ${req.params.cid}` })

			}).catch(err => {
				resp.status(500)
				resp.json({ error: err })
			})
	})

	this.subApp.use((req, resp) => {
		resp.status(404)
		resp.json({ error: `Resource not found: ${req.originalUrl}` })
	});

	return (this.subApp);
}

module.exports = function(app, bggdb) {
	return (new f(app, bggdb));
}
