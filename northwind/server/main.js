const fs = require('fs')

const { join } = require('path');

const morgan = require('morgan');
const cors = require('cors')
const bodyParser = require('body-parser')
const hbs = require('express-handlebars')
const mysql = require('mysql');
const express = require('express');

//JSON file to configure the application
const config = require('./config/config.json')

//Or use environment variables to configure the application
//DB_HOST is the host where MySQL is running
//DB_PORT is the port that MySQL is listening on
//DB_USER is the user id used to access MySQL
//DB_PASSWORD is the corresponding password
//INSTANCE_IP_ADDRESS is the IP address of server that is running  this application
//APP_RETRIES the number of retries / ping to the database before failing
//APP_RETRY_INTERVAL inverval in seconds between retries
//APP_EXIT_ON_ERROR if application should exit when it cannot ping database
const DB_HOST = process.env.DB_HOST || config.db_host || 'localhost'
const DB_PORT = parseInt(process.env.DB_PORT) || config.db_port || 3306
const DB_USER = process.env.DB_USER || config.db_user || 'fred'
const DB_PASSWORD = process.env.DB_PASSWORD || config.db_password || 'fred'
const INSTANCE_IP_ADDRESS = process.env.INSTANCE_IP_ADDRESS || 'ip not set'
const RETRIES = parseInt(process.env.APP_RETRIES) || config.app_retries || 3
const RETRY_INTERVAL = (parseInt(process.env.APP_RETRY_INTERVAL) || config.app_retry_interval || 15) * 1000
const EXIT_ON_ERROR = !!process.env.APP_EXIT_ON_ERROR || false;

//APP_PORT is the TCP port that this application listens to
const PORT = parseInt(process.argv[2]) || config.app_port || parseInt(process.env.APP_PORT) || 3000

const mkQuery = function(sql, pool) {
	return function(params) {
		return (new Promise((resolve, reject) => {
			pool.getConnection((err, conn) => {
				if (err)
					return (reject(err));
				conn.query(sql, params || [],
					(err, result) => {
						conn.release()
						if (err)
							return (reject(err))
						resolve(result)
					})
			})
		}))
	}
}

const pool = mysql.createPool({
	host: DB_HOST, port: DB_PORT,
	user: DB_USER, password: DB_PASSWORD,
	database: 'northwind',
	connectionLimit: 4
});

let appReady = false;
let appFailed = false;
let startTime = 0
let retries = 0
let failedMessage = `Cannot connect to database ${DB_HOST} on ${DB_PORT} with user ${DB_USER}`

let isAngular = false;
try {
	//Hack - check if this is an angular build
	fs.statSync(join(__dirname, '.angular'))
	isAngular = true;
} catch (err) { }


const listCustomers = mkQuery('select id, company from customers limit ? offset ?', pool)
const getCustomerById = mkQuery('select * from customers where id = ?', pool)

const app = express()

app.engine('hbs', hbs())
app.set('view engine', 'hbs')
app.set('views', join(__dirname, 'views'))

app.use(morgan('tiny'))
app.use(cors());
app.use(bodyParser.json());

app.get(['/api/customers', '/customers', '/'], (req, resp, next) => {

	//Hack - check if we should serve angular files
	if (isAngular && ('/' == req.path))
		return (next())

	const limit = parseInt(req.query.limit) || 10
	const offset = parseInt(req.query.offset) || 0
	listCustomers([limit, offset])
		.then(result => {
			resp.status(200)
			resp.format({
				'text/html': () => {
					resp.render('customers.hbs', { 
						customer: result, 
						ip_address: INSTANCE_IP_ADDRESS,
						layout: false
					})
				},
				'application/json': () => {
					resp.json(result)
				},
				'default': () => {
					resp.status(415).end()
				}
			})
		})
		.catch(err => {
			resp.status(400).json({ error: err })
		})
})

app.get(['/api/customer/:id', '/customer/:id'], (req, resp) => {
	const custId = parseInt(req.params.id)
	getCustomerById([custId])
		.then(result => {
			if (!!result.length) {
				resp.status(200)
				resp.format({
					'text/html': () => {
						resp.render('customer.hbs', { 
							customer: result[0],
							layout: false
						})
					},
					'application/json': () => {
						resp.json(result[0])
					},
					'default': () => {
						resp.status(415).end()
					}
				});
				return
			}
			resp.status(404)
			resp.format({
				'text/html': () => {
					resp.send('<h2>Not found</h2>')
				},
				'application/json': () => {
					resp.json({ error: 'Not found' })
				},
				'default': () => {
					resp.status(415).end()
				}
			})
		})
})

app.get('/config', (req, resp) => {
	resp.status(200).json({
		port: PORT,
		db_host: DB_HOST,
		db_port: DB_PORT,
		db_user: DB_USER,
		ip_address: INSTANCE_IP_ADDRESS
	})
})

app.get('/health', (req, resp) => {
	resp.status(200).json({ time: (new Date()).getTime() })
})

app.get('/ready', (req, resp) => {
	if (appReady)
		return (
			resp.status(200).json({ 
				failed: false,
				status: appReady,
				uptime: Date.now() - startTime
			})
		);
	else if (appFailed)
		return (
			resp.status(500).json({
				failed: true,
				status: false,
				message: failedMessage
			})
		);
	resp.status(503).json({
		failed: false,
		status: false
	});
})

app.use(express.static(join(__dirname, 'angular')))

app.use(express.static(join(__dirname, 'public')))

app.use((req, resp) => {
	resp.status(404).sendFile(join(__dirname, 'public', '404.html'));
})

app.listen(PORT, () => {
	startTime = Date.now()
	console.info('Application started on PORT %d at %s',
		PORT, (new Date()).toString());
})

setTimeout(function pingDB() {
	pool.getConnection((err, conn) => {
		if (err) {
			appFailed = (++retries >= RETRIES)
			if (!appFailed)
				setTimeout(pingDB, RETRY_INTERVAL)
			else {
				console.error('Application failed. Cannot ping database');
				if (EXIT_ON_ERROR)
					process.exit(1);
			}
			return
		}
		conn.ping((err) => {
			conn.release()
			if (err) {
				appFailed = true;
				failedMessage = err;
				if (EXIT_ON_ERROR)
					process.exit(1);
			}
			appReady = true;
		})
	})

}, RETRY_INTERVAL) 

