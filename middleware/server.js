const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const database = require('./database');

let config = {
	"host": "localhost",
	"user": "graphed",
	"password": "graphed",
	"database": "invest"
}

const SECRET_KEY = 'your_secret_key';
const validUser = {
	username: 'mohit',
	password: 'test@123'
};

const app = express();
const PORT = 6600;
const db = new database(config);
let check = db.connect();

if (check) {
	console.log("connected")
}


app.use(cors());
app.use(bodyParser.json());

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Get token from the Authorization header

    if (!token) {
        return res.sendStatus(401); // No token, unauthorized
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403); // Token is no longer valid
        }
        req.user = user; // Attach user information to the request object
        next(); // Proceed to the next middleware or route handler
    });
}
// login model
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    if (username === validUser.username && password === validUser.password) {
        const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } else {
        res.status(401).send('Invalid credentials');
    }
});






// below main function 

app.get('/api/data',async(req, res) =>{
	console.log(req); 
	await db.connectionPool();
	let data = await db.details();
	console.log(data);
	await db.connectionRelease();
	return res.status(200).json(data);
})

app.post('/api/addurl', async (req, res)=>{
	//to add url to portfolio
	console.log(req);
	console.log(req.body);
	await db.connectionPool();
	await db.addUrl(req.body.url, req.body.name);
	await db.connectionRelease();
	return res.status(200).json({ "status": "success", "details": req.body });
});

app.post('/backend/api/add', async (req, res)=>{
	console.log(req);
	await db.connectionPool();
	for (let url of req.body){
		let isAdd = await db.addPrice(url.id, url.price, url.algo, url.date);
		if (isAdd){
			console.log('Successfull added');
		}
	}

	await db.connectionRelease();
	
	return res.status(200).json({ "status": "success" });
});



app.get('/api/history', async (req, res)=>{
	//here need id of those we want to get history of 
	console.log(req.query);
	const id = req.query.id;
	await db.connectionPool();
	let history = await db.fetchHistory(id);
	db.connectionRelease();
	return res.status(200).json(history);
});

app.post('/api/graph', async (req, res)=>{
	//get history for graph 
	console.log(req);
	await db.fetchHistory(req.id);
	let history = db.connectionRelease();
	return res.status(200).json({ "status": "success", "history": history });
});

app.post('/api/history', async (req, res)=>{
	console.log(req);
	await db.fetchHistory(req.id);
	let history = db.connectionRelease();
	return res.status(200).json({ "status": "success", "history": history });
});



app.listen(PORT, '0.0.0.0', ()=>{
	console.log(`${PORT}`);
});
