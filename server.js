const express = require('express');
const cors = require('cors');
const Invest = require('./invest');
const Calc = require('./equation');
const { ask, send } = require('./axios-request.js');
const bodyParser = require('body-parser');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 5000;

let browser = null;
let invests = null;

(async ()=>{
	browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
		});
	invests = new Invest(browser);
	let urls = await ask();
	let eq = {};
	let data = [];
	for (let url of urls){
		let id = url.Id;
		eq[`${id}`] = `${url.Eq}`;
		let entry = await invests.details(url.Url, url.Id);
		entry.id = id;
		entry.algo = Calc(eq[id],entry);
		entry.date = new Date().toISOString().slice(0, 19).replace('T', ' ');
		data.push(entry);
	}
	await send(data);
	setInterval(async () => { 
		let refreshed_data = await invests.getDetails();
		let newEntry = [];
		for (let refresh of refreshed_data){
			refresh.algo = Calc(eq[refresh.id],refresh);
			refresh.date = new Date().toISOString().slice(0, 19).replace('T', ' ');
			newEntry.push(refresh);
		}
		await send(newEntry);

	}, 20000);
})();
console.log(browser);


app.use(bodyParser.json());
app.use(cors());

app.post('/api/validate', async (req, res)=>{
	console.log('/api/validate');
	console.log(req.body.url);
	let name = await invests.validate(req.body.url);
	return res.status(200).json({name, 'url': req.body.url});
});

app.get('/api/update/all', async (req, res)=>{
	let details = await invests.getDetails();
	console.log(details);
	return res.status(200).json(details);
});

app.get('/api/update', async (req, res) => {
	console.log('*******************','/api/update','****************')
	let details = await invests.update(req.query.id);
	return res.status(200).json(details);
});

app.get('/api/new', async (req, res) => {
	console.log('api/new', req.query.url, req.query.id);
	let details = await invests.details(req.query.url, req.query.id);
	return res.status(200).json(details);
});

app.get('/api/close', async (req, res) =>{
	console.log('***********','/api/close', req.query.id, '***********');
	await invests.close(req.query.id);
	return res.status(200).json({'status': 'success'});
});

app.listen(PORT, '0.0.0.0', ()=>{
	console.log(`${PORT}`);
});