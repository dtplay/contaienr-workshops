const { join } = require('path')
const cliParser = require('command-line-args')
const mysql = require('mysql')
const express = require('express')
const hbs = require('express-handlebars')
const bodyParser = require('body-parser')

const cliOptions = [
	{ name: 'port', alias: 'p' },
	{ name: 'html' }, { name: 'api' },
	{ name: 'db_host' }, { name: 'db_port' },
	{ name: 'db_user' }, { name: 'db_password' }
]

const cliValues = cliParser(cliOptions);

const PORT = parseInt(cliValues['port'] || process.env.APP_PORT || 3000)
const IP = process.env.POD_IP || '0.0.0.0'

const config = {
	host: cliValues['db_host'] || process.env.BGG_DB_HOST || '127.0.0.1',
	port: parseInt(cliValues['db_port'] || process.env.BGG_DB_PORT || 3306),
	user: cliValues['db_user'] || process.env.BGG_DB_USER || 'root',
	password: cliValues['db_password'] || process.env.BGG_DB_PASSWORD || 'changeit',
	database: process.env.BGG_DB || 'bgg',
	connectionLimit: process.env.BGG_DB_CONNECTION_LIMIT || 2
}
const bggdb = require('./lib/bggdb')(config)

const app = express();

const api = require('./lib/api')(app, bggdb)

if ('html' in cliValues) {
	//HTML can only be mounted on /
	config.html = '/'
	config.bootstrap = !!(cliValues['html'] && ('bootstrap' == cliValues['html']));
	app.use(require('./lib/html')(app, bggdb, config.bootstrap))
	console.info(`Mounting 'html' (bootstrap: ${config.bootstrap})`)
}

if ('api' in cliValues) {
	console.info(`Mounting 'api' on ${cliValues['api']? cliValues['api']: '/'}`)
	config.api = cliValues['api'] || '';
	app.use(config.api, require('./lib/api')(app, bggdb));
}

app.get('/config', (req, resp) => {
	resp.status(200).type('application/json')
	resp.json({
		host: config.host,
		port: config.port,
		user: config.user,
		password: config.password,
		database: config.database,
		connectionLimit: config.connectionLimit,
		html: config.html || '<not available>',
		api: config.api || '<not available>',
		bootstrap: !!config.bootstrap
	});
});

app.get('/health', (req, resp) => {
	resp.status(200).type('application/json')
	resp.json({ timestamp: (new Date()).toGMTString() });
})

app.use((req, resp) => {
	resp.status(404);
	resp.format({
		'text/html': () => {
			resp.send(`<h1>Not Found</h1><h3>Resource not found: ${req.originalUrl}</h3>`);
		},
		'application/json': () => {
			resp.json({ error: `Resource not found: ${req.originalUrl}` })
		}
	})
})

bggdb.ping()
	.then(() => {
		app.listen(PORT, () => {
			console.info(`Application started at ${new Date().toGMTString()} on ${IP}:${PORT}`)
		});
	})
	.catch(err => {
		console.error('Cannot ping database: ', err);
	})
