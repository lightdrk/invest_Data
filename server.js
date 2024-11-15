const express = require('express');
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const winston = require('winston');
const bodyParser = require('body-parser');
const database = require('./database/database');

let config = {
	"host": "localhost",
	"user": "graphed",
	"password": "graphed",
	"database": "invest"
}

const logger = winston.createLogger({
	level: 'info',
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(
				winston.format.colorize(),
				winston.format.simple()
			)
		}),
		new winston.transports.File({ filename: 'logs/app.log'})
	]

});


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
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'] && req.headers['authorization'].split(' ')[1]; // Get token from the Authorization header

    if (!token) {
        return res.sendStatus(401); // No token, unauthorized
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
			logger.error('jwt token no longer valid');
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
	await db.connectionPool();
	let data = await db.details();
	logger.info('/api/data --> endpoint');
	await db.connectionRelease();
	return res.status(200).json(data);
})

app.post('/api/addurl', async (req, res)=>{
	//to add url to portfolio
	logger.info('/api/addurl -->endpoint');
	logger.info(req.body);
	try{
		await db.connectionPool();
		let id = await db.addUrl(req.body.url, req.body.name);
		await db.connectionRelease();
		return res.status(200).json({ "status": "success", id });
	}catch(err){
		logger.error(`Error adding Url: ${err.message}`);
		return res.status(500).json({"status": "error", "message": err.message});
	}
});

app.post('/backend/api/add', async (req, res)=>{
	logger.info('/backend/api/add ---> endpoint');

	try {
        await db.connectionPool();
        for (let url of req.body) {
            logger.info(`Adding price for URL ID: ${url.id}`);
            let isAdd = await db.addPrice(url.id, url.price, url.algo, url.date);
            if (isAdd) {
                logger.info(`Price added successfully for URL ID: ${url.id}`);
            }
        }
        await db.connectionRelease();
        res.status(200).json({ "status": "success" });
    } catch (err) {
        logger.error(`Error adding prices: ${err.message}`);
        res.status(500).json({ "status": "error", "message": err.message });
    }

});



app.get('/api/table', async (req, res)=>{
	//here need id of those we want to get history of 
	const id = req.query.id;
    logger.info(`/api/table --> endpoint for ID: ${id}`);
    try {
        await db.connectionPool();
        let history = await db.fetchHistory(id);
        await db.connectionRelease();
        logger.info(`Fetched history for ID: ${id}`);
        res.status(200).json(history);
    } catch (err) {
        logger.error(`Error fetching table history: ${err.message}`);
        res.status(500).json({ "error": err.message });
    }
});

//app.post('/api/graph', async (req, res)=>{
//	//get history for graph 
//	await db.connectionPool();
//	await db.fetchHistory(req.id);
//	let history = db.connectionRelease();
//	return res.status(200).json({ "status": "success", "history": history });
//});

app.get('/api/history', async (req, res)=>{
	const { id, day } = req.query;
    logger.info(`/api/history --> endpoint for ID: ${id}, Day: ${day}`);
    try {
        await db.connectionPool();
        let history = await db.history(id, day);
        await db.connectionRelease();
        logger.info(`Fetched history for ID: ${id}, Day: ${day}`);
        res.status(200).json(history);
    } catch (err) {
        logger.error(`Error fetching history: ${err.message}`);
        res.status(500).json({ "error": err.message });
    }
});

app.get('/api/remove', async (req, res)=>{
	//here need id of those we want to get history of 
	const id = req.query.id;
    logger.info(`/api/remove --> endpoint for ID: ${id}`);
    try {
        await db.connectionPool();
        let removed = await db.remove(id);
        await db.connectionRelease();
        logger.info(`Removed item with ID: ${id}`);
        res.status(200).json({ "status": "success" });
    } catch (err) {
        logger.error(`Error removing item: ${err.message}`);
        res.status(500).json({ "error": err.message });
    }
});

app.get('/api/update', async (req, res)=>{
	//this will update eq 
	const { id, eq } = req.query;
    logger.info(`/api/update --> endpoint for ID: ${id}, Eq: ${eq}`);
    try {
        await db.connectionPool();
        let update = await db.updateAlgo(eq, id);
        await db.connectionRelease();
        logger.info(`Updated equation for ID: ${id}`);
        res.status(200).json(update);
    } catch (err) {
        logger.error(`Error updating equation: ${err.message}`);
        res.status(500).json({ "error": err.message });
    }
});

app.get('/api/eq', async (req, res) =>{
	//this will get eq
	const id = req.query.id;
    logger.info(`/api/eq --> endpoint for ID: ${id}`);
    try {
        await db.connectionPool();
        const eq = await db.equation(id);
        await db.connectionRelease();
        logger.info(`Fetched equation for ID: ${id}`);
        res.status(200).json(eq);
    } catch (err) {
        logger.error(`Error fetching equation: ${err.message}`);
        res.status(500).json({ "error": err.message });
    }
	
});


app.listen(PORT, '0.0.0.0', ()=>{
	logger.info(`Server is running on port ${PORT}`);
});
