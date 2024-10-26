
class Invest {
	constructor(browser){
		this.browser = browser; 
		this.urlsObject = {};
		this.idsObject = [];
	}
	
	async validate(url){
		//if url is valid then it returns name else return null in name
		try{
		const context = await this.browser.createBrowserContext();
		let page = await context.newPage();
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');
		await page.setExtraHTTPHeaders({
    		'Accept-Language': 'en-US,en;q=0.9',
    		'Accept-Encoding': 'gzip, deflate, br',
		});
		await page.goto(url, {waitUntil: 'load'});
		let name = null;
		const validation = await page.$('#overview-chart_overview-chart-v3__lfcT_') || 0;
		if (validation){
			name = await page.$$('h1');
			name = await page.evaluate( el => el.innerText, name[0]);
		}
		await page.close();
		await context.close();

		return name;
		}catch (err) {
			console.log('error');
		}
	}

	async update(url) {

		
	}

	async details(url, id) {
		const context = await this.browser.createBrowserContext();
		let page = await context.newPage();
		await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');
		await page.setExtraHTTPHeaders({
    			'Accept-Language': 'en-US,en;q=0.9',
    			'Accept-Encoding': 'gzip, deflate, br',
		});
		await page.goto(url, {waitUntil: 'domcontentloaded'});
		let priceData = await page.$$('div[data-test="instrument-price-last"]');
		let name = await page.$$('h1');
		let name_txt = await page.evaluate( el => el.innerText, name[0]);
		let price_txt = await page.evaluate( el => el.innerText, priceData[0]);
		this.urlsObject[id] = {context, page};
		this.idsObject.push(id);
		return {'name': name_txt, 'price': price_txt};
	}

	async getDetails() {
		let data = [];
		for (let id of this.idsObject){
			let page = this.urlsObject[id].page;

			let priceData = await page.$$('div[data-test="instrument-price-last"]');
			let name = await page.$$('h1');
			let name_txt = await page.evaluate( el => el.innerText, name[0]);
			let price_txt = await page.evaluate( el => el.innerText, priceData[0]);
			data.push({'id': id, 'name': name_txt, 'price': price_txt});
		}
		return data ;
	}


}

module.exports = Invest;

