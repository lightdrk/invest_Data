let usdInr = 84;

async function fetchData(url){
	try {
		const response = await fetch(url, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok){
			throw new Error(`HTTP error ! status:, ${response.status}`);
		}
		const data = await response.json();
		console.log(data);
		return data;

	}catch (err){
		console.error('Error fetching data:', err);
	}
}

function change(prev, val){
	prev = parseFloat(prev.replace(/,/g, ''))
    val = parseFloat(val.replace(/,/g, ''))
	if (prev > val){
		return -1;
	}else if (val > prev){
		return 1;
	}else {
		return 0;
	}
}


function equationEval(eq,price){
	// this funciton evaluates the equation and returs results
	if (eq == null){
		return price;
	}
	price = parseFloat(price.replace(/,/g, ''));
	let exp = eq.replace("price",price);
	let result = eval(exp);
	return result;
}

async function fetchDataHistory(id){
	try {
		const response = await fetch(`http://localhost:6600/api/table?id=${id}`,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok){
			throw new Error(`HTTP error ! status:, ${response.status}`);
		}
		const data = await response.json();
		console.log(data);
		return data;

	}catch (err){
		console.error('Error fetching data:', err);
	}

}

async function fetchDataGraph(id, day){
	//here day mean till how far back so day can 3 days back from today
	try {
		const response = await fetch(`http://localhost:6600/api/history?id=${id}&day=${day}`,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok){
			throw new Error(`HTTP error ! status:, ${response.status}`);
		}
		const data = await response.json();
		console.log(data);
		return data;

	}catch (err){
		console.error('Error fetching data:', err);
	}

}

async function remove(id){
	try {
		const response = await fetch(`http://localhost:6600/api/remove?id=${id}`,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok){
			throw new Error(`HTTP error ! status:, ${response.status}`);
		}
		const data = await response.json();
		console.log(data);
		return data;
	}catch (err) {
		console.error('Error Remove data:', err);
	}
}

async function update(id) {
	let _url = `http://localhost:5000/api/update?id=${id}`;
	if (!id) {
		_url = "http://localhost:5000/api/update/all";
	}
	try {
		const response = await fetch(_url,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		const res = await response.json();
		return res;

	}catch (err){
		console.error('unable to send request: ',err)
	}
}

async function updateEq(id,eq){
	try {
		const response = await fetch(`http://localhost:6600/api/update?id=${id}&eq=${eq}`,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok){
			throw new Error(`HTTP error ! status:, ${response.status}`);
		}
		const data = await response.json();
		console.log(data);
		return data;
	}catch (err) {
		console.error('Error Remove data:', err);
	}
}

async function equation(id){
	try {
		const response = await fetch(`http://localhost:6600/api/remove?id=${id}`,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok){
			throw new Error(`HTTP error ! status:, ${response.status}`);
		}
		const data = await response.json();
		return data;
	}catch (err) {
		console.error('Error Remove data:', err);
	}
}

async function exchange(id){
	try {
		const response = await fetch(`http://localhost:5000/api/exchange`,{
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			}
		});
		if (!response.ok){
			throw new Error(`HTTP error ! status:, ${response.status}`);
		}
		const data = await response.json();
		return data;
	}catch (err) {
		console.error('Error Remove data:', err);
	}
}

document.addEventListener('DOMContentLoaded', async ()=>{
	const url = 'http://localhost:6600/api/data';
	let data  = await fetchData(url);
	usdInr = await exchange(); 

	data.forEach( (perCtr) => {
		console.log(perCtr);
		localStorage.setItem(perCtr.Id, JSON.stringify(perCtr));
		document.getElementsByClassName('main-ctr')[0].innerHTML += `
			<div class="ctr" id="${perCtr.Id}c">
			    <div class="upper">
					<h1 style="font-size:18px; margin-right:10px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap">${perCtr.Name}</h1>
					<button class="refresh history"><i class="fa fa-history" style="font-size:18px"></i></button>
					<button class="refresh cross"><i class="fa fa-close" style="font-size:25px"></i></button>
					<button class="refresh remove"><i class="fa fa-minus-circle" style="font-size:24px"></i></button>
			    </div>
			    <div class="details">
					<p>Price :</p>
					<p1	id="algoPrice${perCtr.Id}">----</p1>
					<p1 id="price${perCtr.Id}">15785</p1>
					<i class="fa fa-caret-down" id="down${perCtr.Id}" style="color: red; display: none"></i>
					<i class="fa fa-caret-up" id="up${perCtr.Id}" style="color: green; display: none"></i>
					<button class="refresh updation"><i class="fa fa-refresh" style="font-size:20px"></i></button>
					<button class="refresh equation"><i class="fa fa-calculator" style="font-size:19px"></i></button>
			    </div>
			    <div class="graph-ctr">
					<div class="lower">
						<button class="gh">Graph ↑</button>
						<label class="switch">
							<input type="checkbox" id="${perCtr.Id}mySwitch">
							<span class="slider round"></span>
						</label>
					</div>
					<canvas class="hide graph" id="${perCtr.Id}"></canvas>
					<table class="hide data-table">
						<thead>
							<tr>
								<th>Real Price</th>
								<th>Algo Price</th>
								<th>Date</th>
							</tr>
						</thead>
						<tbody>
						</tbody>
					</table>
			    </div>
			</div>

		`;
		//console.log( 'after loading of html',document.querySelectorAll('.gh'));
	});
	setup();
});












//document.getElementsByClassName('main-ctr')[0].innerHTML += ``;
function setup(){
	let btnDetails = document.querySelectorAll('.gh');
	let btnGraphs = document.querySelectorAll('.graph');
	console.log(btnDetails);
	btnDetails.forEach((btnDetail) =>{
		let isListener = false;
		btnDetail.addEventListener("click", async () => {
			//fetch function needed it will query for history of the id 
			const parentCtr =  btnDetail.offsetParent;
			let btnGraph = btnDetail.offsetParent.querySelector('.graph');
			
			if ((btnDetail.innerText).includes("↑")){
				btnDetail.innerText = "Graph ↓";
				btnGraph.classList.remove("hide");
			}else {
				btnDetail.innerText = "Graph ↑";
				btnGraph.classList.add("hide");
				//switchs.removeEventListener('change', switchHandler);
				return;
			}
			// fetching data for ghrap 	
			let graphData = await fetchDataGraph(btnGraph.id, 1);
			if (!graphData || graphData.length === 0) {
  				console.log('No data available for the graph.');
  				return; // Prevent rendering with no data
			}
			console.log(graphData[0].Time);
			let xValues = [];
			let yValues = [];
			localStorage.setItem(`${btnGraph.id}price`, JSON.stringify(graphData));

			for (let i=graphData.length-1; i >= 0; i--){
				let date = new Date(graphData[i].Date)
				date = date.toLocaleString('en-US',{
        			hour: 'numeric',
        			minute: '2-digit',
        			hour12: false
				});
				xValues.push(date);
				if (graphData[i].AlgoPrice){
					yValues.push(parseFloat(graphData[i].AlgoPrice.replace(/,/g, '')));
				}else {
					yValues.push(parseFloat(graphData[i].RealPrice.replace(/,/g, '')));
				}
			}

			// create the chart and store the instance
			if (btnGraph.chart) {

				btnGraph.chart.data.labels = xValues; // Update labels
				btnGraph.chart.data.datasets[0].data = yValues; // Update dataset
				btnGraph.chart.update(); // Only update the chart instead of destroying it
				//btnGraph.chart.destroy();
			}else {

				btnGraph.chart = new Chart(btnGraph.id, {
				  type: "line",
				  data: {
					labels: xValues,
					datasets: [{
					  label: 'Price',
					  fill: false,
					  lineTension: 0,
					  backgroundColor: "rgba(0,0,255,1.0)",
					  borderColor: "rgba(0,0,255,0.1)",
					  data: yValues
					}]
				  },
				  options: {
					legend: {display: false},
					scales: {
					}
				  }
				});
			}
			//
			//switch changing data from algo price to real price;
			let switchs = document.getElementById(`${parseInt(parentCtr.id)}mySwitch`);
			 //switch function for switching grpah data ...
			let switchHandler = (event, btnGraph, xValues, yValues, id) =>{
			// this function switch data in graph
            	let newXValues = [];
            	let newYValues = [];
				if (event.target.checked) {
					console.log('Switched to Real Price data');
					let fromLocal = JSON.parse(localStorage.getItem(`${id}price`));
					console.log(fromLocal);
					for (let i = fromLocal.length - 1; i >= 0; i--) {
						let date = new Date(fromLocal[i].Date);
						date = date.toLocaleString('en-US', {
							hour: 'numeric',
							minute: '2-digit',
							hour12: false
						});
						newXValues.push(date);
						newYValues.push(parseFloat(fromLocal[i].RealPrice.replace(/,/g, '')));
					}
				console.log('new values on switch --->',newYValues);
				} else {
					console.log('Switched to Algo Price data');
					newXValues = xValues; // AlgoPrice data
					newYValues = yValues;
				}
				console.log('new values on switch --->',newYValues);
				btnGraph.chart.data.labels = newXValues;
				btnGraph.chart.data.datasets[0].data = newYValues;
				btnGraph.chart.update();
				btnGraph.chart.render();
			}

			//switchs.removeEventListener('change', switchHandler); // remove existing event listener to remvoe glitchy issue
			if (!isListener){
				switchs.addEventListener('change', (event) => {
					switchHandler(event, btnGraph, xValues, yValues, parseInt(parentCtr.id));
					isListener = true;
				});
			}
		});
	});


	function notify(id){
		document.getElementById(id).style.display = 'flex';
		setTimeout(()=>{
			document.getElementById(id).style.display = 'none';
		},1000)
	}


	function addIn(url, db_url, callback) {
		console.log(db_url);
		fetch(db_url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body:  JSON.stringify(url)
		}).then(response => {
			if (!response.ok){
				throw new Error(response);
				callback(response)
			}
			return response.json().then(data => {
				callback(data);
			});
		}).catch((error) => {
			console.log(error);
			callback(error);
		});
	}


	document.getElementById('add').addEventListener('click', ()=>{
		document.getElementById('add').disabled=true;
		let toAdd = document.getElementById("url").value;
		console.log(toAdd);
		let db_url = "http://localhost:5000/api/validate";
		toAdd = toAdd.trim();
		let data = {'url': toAdd};
		if (toAdd.length > 24){
			if (toAdd.includes('investing.com')){

				addIn(data, db_url, (res) => {
					console.log(res);
					if (res.name){
						console.log(res.name);
						console.log('Added');
						
						// sending data to db ..
						
						db_url = "http://localhost:6600/api/addurl";
						addIn(res, db_url, async (response) => {
							console.log(response)
							if (response.status === 'success'){
								notify('true');
								document.getElementById("url").classList.add('success');
								setTimeout(()=>{
									document.getElementById("url").classList.remove('success');
									document.getElementById("url").value = '';
								},2000);
								const id = response.id;

								try {
									console.log(toAdd)
									let _url = `http://localhost:5000/api/new?id=${parseInt(id)}&url=${toAdd}`
									const response = await fetch(_url,{
										method: 'GET',
										headers: {
											'Content-Type': 'application/json',
										}
									});
									const res = await response.json();
									console.log(res);
									location.reload();
								}catch (err){
									console.error('unable to send request: ',err)
								}
							}else {
								notify('false');
							}
						});

					}else {
						document.getElementById("url").classList.add('failed');
						setTimeout(()=>{
							document.getElementById("url").classList.remove('failed');
						},1200);
						notify('false');
					}
				});
			}
			}else {
				alert('Wrong url!!');
		}
		document.getElementById('add').disabled=false;
	});

	let refreshBtnEls = document.querySelectorAll('.updation');
	let historyBtnEls = document.querySelectorAll('.history');

	// this adds spin on hover
	refreshBtnEls.forEach((el) => {
		el.addEventListener("mouseover", ()=>{
			el.classList.add('fa-spin');
		});
		
		el.addEventListener("mouseout", ()=>{
			el.classList.remove('fa-spin');
		});
	});

	historyBtnEls.forEach((el) => {
		el.addEventListener("mouseover", ()=>{
			el.classList.toggle('fa-spin');
		});

		el.addEventListener("mouseout", ()=>{
			el.classList.remove('fa-spin');
		});

	});


	//history of the portfolio
	//
	let historyBtns = document.querySelectorAll('.history');
	console.log(historyBtns);
	historyBtns.forEach( async (historyBtn)=>{

		console.log('check -->',historyBtn);
		let parentDiv = historyBtn.offsetParent;

		const id = parseInt(parentDiv.id);
		historyBtn.addEventListener("click", async ()=>{
			historyBtn.style.display = "none";
			console.log("searching history");
			let lower = parentDiv.querySelector('.graph-ctr').querySelector('.lower');
			let cross = parentDiv.querySelector('.upper').querySelector('.cross');
			cross.style.display = 'block';
			lower.style.display = 'none';
			parentDiv.querySelector('.details').style.display = 'none';
			parentDiv.querySelector('.data-table').classList.remove('hide');
			
			console.log('parent div is here ----->>',parentDiv);
			//fetch request for data 
			let tbody = parentDiv.querySelector('.data-table tbody');
			console.log(tbody);
			console.log(id);
			let table = await fetchDataHistory(id);//[{'RealPrice': '112', 'AlgoPrice': '1212', 'Date': '24-10-20204', 'Time': '19:20' },{'RealPrice': '112', 'AlgoPrice': '1212', 'Date': '24-10-20204', 'Time': '19:20' },{'RealPrice': '112', 'AlgoPrice': '1212', 'Date': '24-10-20204', 'Time': '19:20' }];
			console.log('this response from db --->',table);


			table.forEach(column => { 
				let row = document.createElement('tr');
				row.innerHTML='';
				console.log(row);
				row.innerHTML =`
					<td>${column.RealPrice}</td>
					<td>${column.AlgoPrice}</td>
					<td>${column.Date}</td>
				`
				tbody.appendChild(row);
		
			});
			if (!cross.dataset.listenerAdded){
				cross.addEventListener('click', ()=> {
					tbody.innerHTML = '';
					parentDiv.querySelector('.upper').querySelector('.cross').style.display = 'none';
					historyBtn.style.display = "inline-block";
					parentDiv.querySelector('.details').style.display = 'flex';
					parentDiv.querySelector('.data-table').classList.add('hide');
					lower.style.display = 'flex';
				});
				cross.dataset.listenerAdded = true;
			}
		});
	});


	
	//update the price at set interval 
	setInterval(async ()=> {
		let res = await update(null);
		usdInr = await exchange();
		console.log(res);
		for (let data of res){
			//algo needed
			let priceEl = document.querySelector(`#price${data.id}`);
			let algoEl = document.querySelector(`#algoPrice${data.id}`)
			let ch = change(priceEl.textContent, data.price);
			console.log(document.getElementById(`up${data.id}`).display);
			if (ch == 1){
				console.log('up')
				document.getElementById(`up${data.id}`).style.display = 'inline-block';
				document.getElementById(`down${data.id}`).style.display = 'none';
			}else if(ch == -1){
				console.log('down');
				document.getElementById(`up${data.id}`).style.display = 'none';
				document.getElementById(`down${data.id}`).style.display = 'inline-block';

			}else {
				console.log('nothing');
				document.getElementById(`up${data.id}`).style.display = 'none';
				document.getElementById(`down${data.id}`).style.display = 'none';
			
			}
			priceEl.textContent = data.price;
			let equation = JSON.parse(localStorage.getItem(data.id))
			algoEl.textContent = equationEval( equation.Eq, data.price);
		}
	}, 10000);
	



	let refreshBtns = document.querySelectorAll('.updation');
	console.log(refreshBtns);
	refreshBtns.forEach((refreshBtn) => {
		refreshBtn.addEventListener('click', async () => {
			refreshBtn.disabled = true;
			// for now i am getting id from the div.ctr
			let id = parseInt(refreshBtn.offsetParent.id);
			let response = await update(id);
			let equation = JSON.parse(localStorage.getItem(id))
			document.querySelector(`#algoPrice${response.id}`).textContent =equationEval(equation.Eq, response.price);
			document.querySelector(`#price${response.id}`).textContent = response.price;
			refreshBtn.disabled = false;

		});

	})

	// handles removal of the ctr 
	let removeBtns =  document.querySelectorAll('.remove')
	removeBtns.forEach((removeBtn) => {
		removeBtn.addEventListener('click', async () =>{
			const id = parseInt(removeBtn.offsetParent.id);
			console.log(id);
			let isRemoved = await remove(id)
			console.log('--------->',isRemoved);
			if (isRemoved.status === 'success') {
				const response = await fetch(`http://localhost:5000/api/close?id=${parseInt(id)}`,{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					}
				});
				const res = await response.json();
				if (res.status === 'success'){
					console.log('Tab in backend is closed ');
					location.reload();
				}
			}
		});
	});

	
	// add equation on click 
	//
	let equationBtns = document.querySelectorAll('.equation');
	equationBtns.forEach((equationBtn) => {
		let parentDiv = equationBtn.offsetParent;

		const id = parseInt(parentDiv.id);
		equationBtn.addEventListener("click", () => {
			equationBtn.style.display = "none";
			document.querySelector('.history').style.display = "none";

			let lower = parentDiv.querySelector('.graph-ctr').querySelector('.lower');
			let cross = parentDiv.querySelector('.upper').querySelector('.cross');
			cross.style.display = 'block';
			lower.style.display = 'none';
			parentDiv.querySelector('.details').style.display = 'none';
			
			// Create and append the input area for the equation
			let equationArea = parentDiv.querySelector('.equation-area');
			
			// Check if an equation area already exists, otherwise create one
			if (!equationArea) {
				equationArea = document.createElement('textarea');
				equationArea.classList.add('equation-area');
				equationArea.placeholder = `Enter your equation here...\n Example:- price*12 + usdInr\nprice :- current price\n usdInr :- Exchange rate of usd and inr`;
				parentDiv.appendChild(equationArea);
			}
			equationArea.style.display = 'block'; // Show the equation area

		// Create and append the "Submit Equation" button
			let submitBtn = parentDiv.querySelector('.submit-equation-btn');
			
			// Check if the button already exists, otherwise create one
			if (!submitBtn) {
				submitBtn = document.createElement('button');
				submitBtn.classList.add('submit-equation-btn');
				submitBtn.innerText = 'Submit Equation';
				parentDiv.appendChild(submitBtn);

				// Add event listener for the button
				submitBtn.addEventListener('click', async () => {
					let equation = equationArea.value.trim();
					if (equation) {
						console.log('Equation Submitted: ', equation);
						// You can also send this equation to the server or perform other actions
						// For now, it will just log it to the console
						let response = await updateEq(id, equation);
						if (response){
							console.log('Added');
							let rs = await fetch(`http://localhost:5000/api/update-eq?id=${id}&eq=${equation}`,{
								method: 'GET',
								headers: {
											'Content-Type': 'application/json',
								}
							});	
							console.log('success fully added eq--->', rs.body);
							location.reload();
						}
					} else {
						alert('Please enter an equation.');
					}
				});
			}
			submitBtn.style.display = 'inline-block'; // Show the submit button
			console.log('parent div is here ----->>', parentDiv);

			// Add event listener to cross button for hiding the equation area
				cross.addEventListener('click', () => {
					equationArea.style.display = 'none'; // Hide equation area
					submitBtn.style.display = 'none'; // Hide the submit button
					parentDiv.querySelector('.upper').querySelector('.cross').style.display = 'none';
					equationBtn.style.display = "inline-block"; // Show the equation button again
					parentDiv.querySelector('.details').style.display = 'flex'; // Show the details section
					lower.style.display = 'flex'; // Show the lower section
					document.querySelector('.history').style.display = "inline-block";

				});
		});
	});

}

window.addEventListener('beforeunload', () => {
  localStorage.clear();
});
