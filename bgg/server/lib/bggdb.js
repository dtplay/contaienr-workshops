const mysql = require('mysql')

const f = function(config) {
	this.pool = mysql.createPool(config);
	this.ping = function() {
		return (
			this.getConnection(this.pool)
				.then(conn => {
					conn.ping((err) => {
						conn.release()
						return err? Promise.reject(err): Promise.resolve();
					});
				})
		)
	}
	this.findGameByName = this.mkQuery('select gid, name from game where name like ? limit ? offset ?', this.pool);
	this.findGameDetailsByGid = this.mkQuery('select * from game where gid = ?', this.pool);
	this.findCommentDetailsByGid = this.mkQuery('select * from comment where gid = ? limit ? offset ?', this.pool);
	this.findCommentsByGid = this.mkQuery('select c_id from comment where gid = ? limit ? offset ?', this.pool);
	this.findCommentsByCid = this.mkQuery('select * from comment where c_id = ?', this.pool);
	this.countCommentsByGid = this.mkQuery('select count(*) as comment_cnt from comment where gid =?', this.pool);
}

f.prototype.mkQuery = function(sql, pool) {
	return ((args) => {
		return (
			new Promise((resolve, reject) => {
				this.getConnection(pool)
					.then(conn => {
						conn.query(sql, args || [], (err, result) => {
							conn.release();
							if (err)
								return (reject(err));
							resolve(result);
						})
					})
					.catch(err => reject(err));
			})
		);
	});
}

f.prototype.getConnection = function(pool) {
	return (
		new Promise((resolve, reject) => {
			pool.getConnection((err, conn) => {
				if (err)
					return reject(err);
				resolve(conn)
			})
		})
	);
}

module.exports = function(config) {
	return (new f(config));
}
