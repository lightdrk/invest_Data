const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(cors());

app.post('/api/add', async (req, res)=>{
	console.log(req);
	return res.status(200).json({ "status": "success", "details": req.body.url });
});

app.post('/api/update', async (req, res)=>{
	console.log(req);
	let details = "test";
	return res.status(200).json({ "status": "success", "details": details });
});

app.listen(PORT, '0.0.0.0', ()=>{
	console.log(`${PORT}`);
});
