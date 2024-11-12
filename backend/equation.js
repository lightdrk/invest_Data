const math = require('mathjs');


function Calculate(eq, val){

	// eq will be a json object with id 
	console.log('**************** val:', val);
    	console.log('**************** eq:', typeof(eq));

    // If eq is falsy (null, undefined, etc.), return val.price directly
    	if (eq == 'null' || !eq) {
        	console.log('********* Returning val.price directly:', val.price);
        	return val.price;
    	}
	console.log(val.price);
	let price = parseFloat(val.price.replace(/,/g,''));
	let usdInr = parseFloat(val.usdInr.replace(/,/g,''));
	return math.evaluate(eq, {price, usdInr});
}

module.exports = Calculate;
