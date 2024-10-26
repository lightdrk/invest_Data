const mysql = require("mysql2/promise");

class database{
	constructor(config){
		this.config = config;
		this.pool = mysql.createPool({
			host: this.config.host,
			user: this.config.user,
			password: this.config.password,
			database: this.config.database,
			connectionLimit: 10 // adjust connection limit 
		});
		this.connection = null;
	}

	async connect(){
		try{
			this.connection = await mysql.createConnection({
				host: this.config.host,
				user: this.config.user,
				password: this.config.password,
				database: this.config.database

			});
			return 1;
		}catch (err){
			console.error('Unable to connect');
			return 0;
		}

	}
	
	async details(){
		try {
			const [rows] = await this.connection.query('SELECT * FROM urls');
			return rows;
		}catch(err){
			console.log(err);
		}
	}

	async disconnect(){
		try{
			await this.connection.end();
			return 1;

		}catch(err){
			console.error('Unable to disconnect',err);
			return 0;
		}
	}
	
	async connectionPool(){
		try {
			this.connection = await this.pool.getConnection();
			return 1;
		}catch (err){
			console.error('Unable to connect to pool', err);
			return 0;
		}
	}
	
	async connectionRelease(){
		try{
			await this.connection.release();
			return 1;
		}catch(err){
			console.error('Unable to release connection', err);
			return 0;
		}

	}

	async listUrl(query){
		try{
			const [rows] = await this.connection.query('SELECT * FROM products_overview WHERE ID ?',[query]);
			return rows;

		}catch(err){
			console.error('search error', err);
			return 0;
		}
	}

	async urls(){
		try{
			const [rows] = await this.connection.query('SELECT * FROM urls');
			return rows;

		}catch(err){
			console.error('search error', err);
			return 0;
		}
	}

	async addUrl(url, name){
		console.log(url, name)
		try{
			const [result] = await this.connection.execute('insert into urls (Url, Name) values (?, ?)', [url, name]);
			return result;
		}catch(err){
			console.log('unable to add', err);
			return 0;
		}
	}

	async createTable(id) {
		// not needed .. now 
		try {
			const [result] = await this.connection.execute('CREATE TABLE porfolio (Id INT NOT NULL AUTO_INCREMENT PRIMARY KEY, UrlId INT, RealPrice VARCHAR(255) NOT NULL, Algopice VARCHAR(255) NOT NULL, Date DATETIME NOT NULL, Time TIME NOT NULL, FORIGN KEY (UrlId) REFERENCES urls(Id))',[id]);
		}catch(err){
			console.log('unable to create', err);
			return 0;
		}
	}

	async addPrice(id, real, algo, date, time){
		// this is for adding price of stocks
		try{
			const [result] = await this.connection.execute('insert into portfolio (UrlId,RealPrice, AlgoPrice, Date, Time) values (?, ?, ?, ?, ?)', [id, real, algo, date, time]);
			return result;
		}catch(err){
			console.log('unable to add', err);
			return 0;
		}
	}


	async fetchHistory(id){
		// this will fetch history with certian time limit 
		try{

			const [rows] = await this.connection.query('SELECT *  FROM portfolio where UrlId= ? AND Date >= NOW() - INTERVAL 2 DAY ', [id]);
			return rows;

		}catch(err){
			console.log('fetchProduct error ', err);
			return 0;
		}


	}

	async history(id, day){
		try{

			const [rows] = await this.connection.query('SELECT *  FROM portfolio where UrlId= ? AND Date >= NOW() - INTERVAL ? DAY ', [id, day]);
			return rows;
		}catch(err){
			console.log('fetchProduct error ', err);
			return 0;
		}
	}


}

module.exports = database;
