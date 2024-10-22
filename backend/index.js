const puppeteer = require('puppeteer');


(async ()=> {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	});

	const page = await browser.newPage();
	await page.goto('https://in.investing.com/commodities/refined-gold?cid=49776', {waitUntil: 'load'});
	let priceData =	await page.$$('div[data-test="instrument-price-last"]');
	while (true){
		let text = await page.evaluate( el => el.innerText, priceData[0]);
		console.log(text);
		await new Promise(resolve => setTimeout(resolve,2000));
	}

})();
