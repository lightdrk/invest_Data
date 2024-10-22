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

	async search(query){
		try{
			const [rows] = await this.connection.query('SELECT * FROM products_overview WHERE name LIKE ? OR description LIKE ?',[query]);
			return rows;

		}catch(err){
			console.error('search error', err);
			return 0;
		}
	}

	async trending(){
		try{
			const [rows] = await this.connection.query('SELECT * FROM products_overview');
			return rows;

		}catch(err){
			console.error('search error', err);
			return 0;
		}
	}

	async addProduct(data){
		try{
			const [result] = await this.connection.execute('INSERT INTO products_overview (product_id, product_name, price, image_url, mrp, category_id, rating) VALUES (?, ?, ?, ?, ?, ?, ?)', data);
			return result;
		}catch(err){
			console.log('Unable to add', err);
			return 0;
		}
	}

	async fetchProduct(id){
		try{

			const [rows] = await this.connection.query('SELECT * FROM products_overview WHERE product_id = ?', [id]);
			return rows;

		}catch(err){
			console.log('fetchProduct error ', err);
			return 0;
		}


	}


}

module.exports = database;
