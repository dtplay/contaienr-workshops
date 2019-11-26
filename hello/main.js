const { join } = require('path')
const morgan = require('morgan')
const express = require('express')

const APP_PORT = parseInt(process.argv[2]) || parseInt(process.env.APP_PORT) || 3000

const app = express();

app.use(morgan('tiny'))

app.get('/health', (req, resp) => {
	resp.status(200).type('text/plain').end(`${new Date()}: OK`);
});

app.use(express.static(join(__dirname, 'public')));

app.listen(APP_PORT, () => {
	console.log('Application started on port %d at %s', APP_PORT, (new Date()).toString());
});
