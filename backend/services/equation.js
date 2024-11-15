const math = require('mathjs');
const logger = require('../utils/logger');


function Calculate(eq, val){
	try{
		// eq will be a json object with id 
		// If eq is falsy (null, undefined, etc.), return val.price directly
		if (eq == 'null' || !eq) {
			return val.price;
		}
		let price = parseFloat(val.price.replace(/,/g,''));
		let usdInr = parseFloat(val.usdInr.replace(/,/g,''));
		return math.evaluate(eq, {price, usdInr});
	}catch (err){
		logger.error('Error in Calculate() function', { message: err.message, stack: err.stack });
	}
}

module.exports = Calculate;
