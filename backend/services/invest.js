const logger = require('../utils/logger');

class Invest {
	constructor(browser){
		this.browser = browser; 
		this.urlsObject = {};
		this.idsObject = [];
		this.usdExPage = null;
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
			await page.goto(url, {waitUntil: 'domcontentloaded', timeout: 15000});
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
			logger.error('Error in validate() function', { message: err.message, stack: err.stack });
		}
	}

	async update(id) {
		//get the price for a specific id 
		try{
			let page = this.urlsObject[id].page;
			//await page.bringToFront();
			let priceData = await page.$$('div[data-test="instrument-price-last"]');
			let name = await page.$$('h1');
			let name_txt = await page.evaluate( el => el.innerText, name[0]);
			let price_txt = await page.evaluate( el => el.innerText, priceData[0]);
			return {'id': id, 'name': name_txt, 'price': price_txt};
		}catch(err){
			logger.error('Error in update(id) function', { message: err.message, stack: err.stack });
			return null;
		}
	}

	async details(url, id) {
		// updating(getting )details for single id 
		try{

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
		}catch(err){
			logger.error('Error in details(url, id) function', { message: err.message, stack: err.stack });
			return null;
		}
	}

	async getDetails() {
		// getting details for all open browsers
		try {

			let data = [];
			for (let id of this.idsObject){
				let page = this.urlsObject[id].page;
				//await page.bringToFront();

				let priceData = await page.$$('div[data-test="instrument-price-last"]');
				let name = await page.$$('h1');
				let name_txt = await page.evaluate( el => el.innerText, name[0]);
				let price_txt = await page.evaluate( el => el.innerText, priceData[0]);
				data.push({'id': id, 'name': name_txt, 'price': price_txt});
			}
			return data ;
		}catch (err) {
			logger.error('Error in details(url, id) function', { message: err.message, stack: err.stack });
			return null;
		}
	}

	async usdExchange(){
		try {
			if (!this.usdExPage){
				const context = await this.browser.createBrowserContext();
				this.usdExPage = await context.newPage();
				await this.usdExPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');
				await this.usdExPage.setExtraHTTPHeaders({
						'Accept-Language': 'en-US,en;q=0.9',
						'Accept-Encoding': 'gzip, deflate, br',
				});
				await this.usdExPage.goto("https://in.investing.com/currencies/usd-inr", {waitUntil: 'domcontentloaded'});
			}
			let priceData = await this.usdExPage.$$('div[data-test="instrument-price-last"]');
			let price_txt = await this.usdExPage.evaluate( el => el.innerText, priceData[0]);

			return price_txt;
		}catch (err) {
			logger.error('Error in details(url, id) function', { message: err.message, stack: err.stack });
			return null;
		}

	}

	async close(id) {
		try {

			logger.info('statring to close ....');
			for (let obj in this.idsObject){
				if ( this.idsObject[obj] == id){
					logger.info('closing ......')
					logger.info(await this.urlsObject[id].page);
					await this.urlsObject[id].page.close();
					await this.urlsObject[id].context.close();
					//removing / cleaning the array 
					this.idsObject.splice(obj,1);
					delete this.urlsObject[id];
					logger.info('object ->>>>>>>',this.urlsObject);
					logger.info('array --------->', this.idsObject);
					break;
				}
			}
		}catch (err) {
			logger.error('Error in details(url, id) function', { message: err.message, stack: err.stack });
			return null;
		}

	}

}

module.exports = Invest;

