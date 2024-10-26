const puppeteer = require('puppeteer');
const process = require('process');
//need more research
(async ()=> {
	const browser = await puppeteer.launch({
		headless: false,
		defaultViewport: null,
	});

	const page = await browser.newPage();
	await page.setRequestInterception(true);
	page.on('request', (request) => {
		console.log(request);
		console.log(request.resourceType());
		console.log('**************');
			if (request.resourceType() === 'image' || request.resourceType() === 'stylesheet' || request.resourceType() === 'other'){
				request.abort();
			}else {
				request.continue();
			}
	});
	await page.goto('https://in.investing.com/commodities/refined-gold?cid=49776', {waitUntil: 'load'});
	let priceData =	await page.$$('div[data-test="instrument-price-last"]');
	while (true){
		let text = await page.evaluate( el => el.innerText, priceData[0]);
		console.log(text);
		console.log('********** PAGE USAGE METRIC **************')
		let pageMetrics = await page.metrics();
		console.log(pageMetrics);
		const { rss, heapTotal, heapUsed, external } = process.memoryUsage();
		const simple = {
        	rss: (rss / 1024 / 1024).toFixed(2) + ' MB',
        	heapTotal: (heapTotal / 1024 / 1024).toFixed(2) + ' MB',
        	heapUsed: (heapUsed / 1024 / 1024).toFixed(2) + ' MB',
        	external: (external / 1024 / 1024).toFixed(2) + ' MB',
    	};
		console.log('**********node script RAM (usage)*************',);
		console.log(simple)
		await new Promise(resolve => setTimeout(resolve,2000));
	}

})();
