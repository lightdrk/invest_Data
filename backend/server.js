const cors = require('cors');
const express = require('express');
const puppeteer = require('puppeteer');
const logger = require('./utils/logger');
const bodyParser = require('body-parser');
const Invest = require('./services/invest');
const Calc = require('./services/equation');
const { ask, send } = require('./services/axios-request.js');

const app = express();
const PORT = 5000;
let browser = null;
let invests = null;
let eq = {};
let usdInr = '84';

(async ()=>{
    let data = [];
	try{
		browser = await puppeteer.launch({
				headless: true,
				defaultViewport: null,
			});
		invests = new Invest(browser);
		let urls = await ask();
		for (let url of urls){
			let id = url.Id;
			eq[`${id}`] = `${url.Eq}`;
			let entry = await invests.details(url.Url, url.Id);
			entry.id = id;
			entry['usdInr'] = usdInr;
			entry.algo = Calc(eq[id],entry);
			entry.date = new Date().toISOString().slice(0, 19).replace('T', ' ');
			data.push(entry);
		}
	}catch (err){
		logger.error(`Error adding Url: ${err.message}`);
	}
	await send(data);
	try {

		setInterval(async () => { 
			let refreshed_data = await invests.getDetails();
			let newEntry = [];
			for (let refresh of refreshed_data){
				refresh['usdInr'] = usdInr;
				refresh.algo = Calc(eq[refresh.id],refresh);
				refresh.date = new Date().toISOString().slice(0, 19).replace('T', ' ');
				newEntry.push(refresh);
			}
			await send(newEntry);

		}, 20000);
	}catch (err){
		logger.error(`Error setInterval `, { message: err.message, stack: err.stack })
	}
})();
app.use(bodyParser.json());
app.use(cors());

// POST request to validate URL
app.post('/api/validate', async (req, res) => {
    logger.info('/api/validate request received');
    try {
        let name = await invests.validate(req.body.url);
        if (!name) {
            logger.warn(`Validation failed for URL: ${req.body.url}`);
            return res.status(400).json({ message: 'Invalid URL or validation failed.' });
        }
        return res.status(200).json({ name, url: req.body.url });
    } catch (err) {
        logger.error(`Error in /api/validate: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// GET request to update all data
app.get('/api/update/all', async (req, res) => {
    logger.info('/api/update/all request received');
    try {
        let details = await invests.getDetails();
        if (!details) {
            logger.warn('Details not found during /api/update/all');
            return res.status(404).json({ message: 'Details not found or error in fetching details.' });
        }
        logger.info('Details fetched successfully');
        return res.status(200).json(details);
    } catch (err) {
        logger.error(`Error in /api/update/all: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// GET request to update specific data based on id
app.get('/api/update', async (req, res) => {
    logger.info(`/api/update received for ID: ${req.query.id}`);
    try {
        let details = await invests.update(req.query.id);
        if (!details) {
            logger.warn(`Details not found for ID: ${req.query.id}`);
            return res.status(404).json({ message: `Details not found for id: ${req.query.id}` });
        }
        logger.info(`Details updated for ID: ${req.query.id}`);
        return res.status(200).json(details);
    } catch (err) {
        logger.error(`Error in /api/update: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// GET request to fetch new data based on URL and ID
app.get('/api/new', async (req, res) => {
    logger.info(`/api/new request received with URL: ${req.query.url} and ID: ${req.query.id}`);
    try {
        let details = await invests.details(req.query.url, req.query.id);
        if (!details) {
            logger.warn(`No details found for URL: ${req.query.url} and ID: ${req.query.id}`);
            return res.status(404).json({ message: `Details not found for URL: ${req.query.url} and ID: ${req.query.id}` });
        }
        logger.info(`Details fetched successfully for URL: ${req.query.url} and ID: ${req.query.id}`);
        return res.status(200).json(details);
    } catch (err) {
        logger.error(`Error in /api/new: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// GET request to close data by id
app.get('/api/close', async (req, res) => {
    logger.info(`/api/close request received for ID: ${req.query.id}`);
    try {
        await invests.close(req.query.id);
        logger.info(`Successfully closed data for ID: ${req.query.id}`);
        return res.status(200).json({ status: 'success' });
    } catch (err) {
        logger.error(`Error in /api/close: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// GET request to update eq data based on id
app.get('/api/update-eq', async (req, res) => {
    logger.info(`/api/update-eq received for ID: ${req.query.id} with EQ value: ${req.query.eq}`);
    try {
        eq[req.query.id] = req.query.eq;
        logger.info(`EQ updated for ID: ${req.query.id}`);
        return res.status(200).json({ status: 'success' });
    } catch (err) {
        logger.error(`Error in /api/update-eq: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});

// GET request to fetch USD to INR exchange rate
app.get('/api/exchange', async (req, res) => {
    logger.info('/api/exchange request received');
    try {
        let price = await invests.usdExchange();
        if (!price) {
            logger.warn('Exchange rate not found');
            return res.status(404).json({ message: 'Exchange rate not found' });
        }
        logger.info(`Exchange rate fetched: ${price}`);
        usdInr = price;
        return res.status(200).json(price);
    } catch (err) {
        logger.error(`Error in /api/exchange: ${err.message}`);
        return res.status(500).json({ message: 'Internal Server Error', error: err.message });
    }
});app.listen(PORT, '0.0.0.0', ()=>{
	logger.info(`${PORT}`);
});
