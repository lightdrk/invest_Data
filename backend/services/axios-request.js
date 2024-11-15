const axios = require('axios');
const logger = require('../utils/logger');

async function ask() {
	try {

		const response = await axios.get('http://localhost:6600/api/data');
		return response.data;

	}catch (err){
		logger.error('Error in ask() function', { message: err.message, stack: err.stack });
		return null
	}

}

async function send(data){
	try {
		const response = await axios.post('http://localhost:6600/backend/api/add', data);
		return response;
	}catch (err){
		logger.error('Error in send() function', { message: err.message, stack: err.stack });
	}

}

module.exports = {ask, send};
