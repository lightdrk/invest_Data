const axios = require('axios');

async function ask() {
	try {

		const response = await axios.get('http://localhost:6600/api/data');
		console.log(response);
		return response.data;

	}catch (err){
		console.log('Error Sending request', err);
	}

}

async function send(data){
	try {
		const response = await axios.post('http://localhost:6600/backend/api/add', data);
		console.log(response);
		return response;
	}catch (err){
		console.error('Error sending request', err);
	}

}

module.exports = {ask, send};
