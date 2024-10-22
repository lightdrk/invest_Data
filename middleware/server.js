const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const database = require('database');

let config = {
	"host": "localhost",
	"user": "graphed",
	"password": "graphed",
	"database": "invest"
}


const app = express();
const PORT = 6000;
const db = database(config);
let check = db.connect();

if (check) {
	console.log("connected")
}

app.use(bodyParser.json());
app.use(cors());

app.post('/api/add', async (req, res)=>{
	//to add data to portfolio
	console.log(req);
	db.connectionPool();
	db.addUrl(req.url, req.name);
	db.connectionRelease();
	return res.status(200).json({ "status": "success", "details": req.body.url });
});

app.post('/api/addurl', async (req, res)=>{
	//to add data to portfolio
	console.log(req);
	db.connectionPool();
	db.addUrl(req.url);
	db.addPrice(req.name, req.real, req.algo, req.time);
	db.connectionRelease();
	
	return res.status(200).json({ "status": "success", "details": req.body.url });
});



app.post('/api/history', async (req, res)=>{
	//here need id of those we want to get history of 
	console.log(req);
	db.fetchHistory(req.id);
	let history = db.connectionRelease();
	return res.status(200).json({ "status": "success", "history": history });
});

app.post('/api/graph', async (req, res)=>{
	//get history for graph 
	console.log(req);
	db.fetchHistory(req.id);
	let history = db.connectionRelease();
	return res.status(200).json({ "status": "success", "history": history });
});

app.post('/api/history', async (req, res)=>{
	console.log(req);
	db.fetchHistory(req.id);
	let history = db.connectionRelease();
	return res.status(200).json({ "status": "success", "history": history });
});


app.listen(PORT, '0.0.0.0', ()=>{
	console.log(`${PORT}`);
});
