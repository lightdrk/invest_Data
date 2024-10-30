const express = require('express');
const cors = require('cors');
const Invest = require('./invest');
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
	console.log('urls ---> ', urls);
	let data = [];
	for (let url of urls){
		console.log(url);
		let id = url.Id;
		let entry = await invests.details(url.Url, url.Id);
		entry.id = id;
		entry.algo = entry.price + 10;
		entry.date = new Date().toISOString().slice(0, 19).replace('T', ' ');
		data.push(entry);
	}
	console.log(data);
	await send(data);
	setInterval(async () => { 
		let refreshed_data = await invests.getDetails();
		let newEntry = [];
		for (let refresh of refreshed_data){
			refresh.algo = refresh.price + 10;
			refresh.date = new Date().toISOString().slice(0, 19).replace('T', ' ');
			newEntry.push(refresh);
		}
		console.log(newEntry);
		await send(newEntry);

	}, 600000);
})();
console.log(browser);


app.use(bodyParser.json());
app.use(cors());

app.post('/api/validate', async (req, res)=>{
	console.log(req);
	console.log(req.body.url);
	let name = await invests.validate(req.body.url);
	return res.status(200).json({name, 'url': req.body.url});
});

app.get('/api/update/all', async (req, res)=>{
	console.log(req);
	let details = await invests.getDetails();
	console.log(details);
	return res.status(200).json(details);
});

app.get('/api/update', async (req, res) => {
	console.log(req);
	console.log('*******************',req,'****************')
	let details = await invests.update(req.query.id);
	return res.status(200).json(details);
});

app.listen(PORT, '0.0.0.0', ()=>{
	console.log(`${PORT}`);
});
