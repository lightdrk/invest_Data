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
		entry.date = new Date().toISOString().slice(0, 10);
		entry.time = new Date().toLocaleTimeString('en-US', { hour12: false });
		data.push(entry);
	}
	console.log(data);
	await send(data);
	setInterval(async () => { 
		let refreshed_data = await invests.getDetails();
		let newEntry = [];
		for (let refresh of refreshed_data){
			refresh.algo = refresh.price + 10;
			refresh.date = new Date().toISOString().slice(0, 10);
			refresh.time = new Date().toLocaleTimeString('en-US', { hour12: false });
			newEntry.push(refresh);
		}
		console.log(newEntry);
		await send(newEntry);

	}, 100000);
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

app.post('/api/update', async (req, res)=>{
	console.log(req);
	let details = "test";
	return res.status(200).json({ "status": "success", "details": details });
});

app.listen(PORT, '0.0.0.0', ()=>{
	console.log(`${PORT}`);
});
