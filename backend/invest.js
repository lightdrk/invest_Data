const puppeteer = require('puppeteer');

class Invest {
	constructor(){
		this.browser = await puppeteer.launch({
			headless: false,
			defaultViewport: null,
		});
	}

	async update(url) {
		
	}

	async details(url) {
		let page =  await this.browser.newPage();

		await page.goto(url, {waitUntil: 'load'});
		let priceData = await page.$$('div[data-test="instrument-price-last"]');
		let name = await page.$$('h1');
		let name_txt = await page.evaluate( el => el.innerText, name[0]);
		let price_txt = await page.evaluate( el => el.innerText, priceData[0]);
		return {'name': name_txt, 'price': price_txt};
	}

	


}
