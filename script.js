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

async function fetchDataHistory(id){
	try {
		const response = await fetch(`http://localhost:6600/api/history?id=${id}`,{
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

document.addEventListener('DOMContentLoaded', async ()=>{
	const url = 'http://localhost:6600/api/data';
	let data  = await fetchData(url);
	
	data.forEach( (perCtr) => {
		document.getElementsByClassName('main-ctr')[0].innerHTML += `
			<div class="ctr" id="${perCtr.Id}c">
			    <div class="upper">
					<h1 style="font-size:20px; margin-right:10px; overflow:hidden; text-overflow: ellipsis; white-space: nowrap">${perCtr.Name}</h1>
					<button class="refresh history"><i class="fa fa-history" style="font-size:18px"></i></button>
					<button class="refresh cross"><i class="fa fa-close" style="font-size:25px"></i></button>
			    </div>
			    <div class="details">
					<p>Price :</p>
					<p1 id="algoPrice${perCtr.Id}">15785</p1>
					<i class="fa fa-caret-down" id="down${perCtr.Id}" style="color: red; display: none"></i>
					<i class="fa fa-caret-up" id="up${perCtr.Id}" style="color: green; display: none"></i>
					<button class="refresh updation"><i class="fa fa-refresh" style="font-size:20px"></i></button>
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
		btnDetail.addEventListener("click", async () => {
			//fetch function needed it will query for history of the id 
			const parentCtr =  btnDetail.offsetParent;
			btnGraph = btnDetail.offsetParent.querySelector('.graph');

			if ((btnDetail.innerText).includes("↑")){
				btnDetail.innerText = "Graph ↓";
				btnGraph.classList.remove("hide");
			}else {
				btnDetail.innerText = "Graph ↑";
				btnGraph.classList.add("hide");
			}
			// fetching data for ghrap 	
			let graphData = await fetchDataGraph(btnGraph.id, 5)
			console.log(graphData[0].Time);
			let xValues = [];
			let yValues = [];
			localStorage.setItem('RealPrice', JSON.stringify(graphData));

			for (let i=graphData.length-1; i >= 0; i--){
				let date = new Date(graphData[i].Date)
				date = date.toLocaleString('en-US',{
        			hour: 'numeric',
        			minute: '2-digit',
        			hour12: false
				});
				xValues.push(date);
				console.log(graphData[i].AlgoPrice.slice(0,3));
				yValues.push(parseFloat(graphData[i].AlgoPrice.replace(/,/g, '')));
			}

			// create the chart and store the instance
			if (btnGraph.chart) {
				btnGraph.chart.destroy();
			}

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
			//
			//switch changing data from algo price to real price;
			let switchs = document.getElementById(`${parseInt(parentCtr.id)}mySwitch`);
			switchs.removeEventListener('change', switchHandler); // remove existing event listener to remvoe glitchy issue
			switchs.addEventListener('change', switchHandler);
			function switchHandler(event) {
            	let newXValues = [];
            	let newYValues = [];

				if (event.target.checked) {
					console.log('Switched to Real Price data');
					let fromLocal = JSON.parse(localStorage.getItem('RealPrice'));

					for (let i = fromLocal.length - 1; i >= 0; i--) {
						let date = new Date(fromLocal[i].Date);
						date = date.toLocaleString('en-US', {
							hour: 'numeric',
							minute: '2-digit',
							hour12: false
						});
						newXValues.push(date);
						newYValues.push(fromLocal[i].RealPrice);
					}

					chart.data.labels = newXValues;
					chart.data.datasets[0].data = newYValues;
				} else {
					console.log('Switched to Algo Price data');
					chart.data.labels = xValues; // AlgoPrice data
					chart.data.datasets[0].data = yValues;
				}

				chart.update();
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
				console.log('custom  -->',response);
				callback(response)
			}
			return response.json().then(data => {
				callback(data);
			});
		}).catch((error) => {
			console.log(error);
			callback(error);
			console.error(error);
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
						addIn(res, db_url, (response) => {
							console.log(response)
							if (response.status === 'success'){
								notify('true');
								document.getElementById("url").classList.add('success');
								setTimeout(()=>{
									document.getElementById("url").classList.remove('success');
									document.getElementById("url").value = '';
								},2000);
							}else {
								notify('false');
							}
						});

					}else {
						document.getElementById("url").classList.add('failed');
						setTimeout(()=>{
							document.getElementById("url").classList.remove('failed');
						},1200);
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
			el.classList.add('fa-spin');
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

	setInterval(async ()=> {
		let res = await update(null);
		console.log(res);
		for (let data of res){
			//algo needed
			let priceEl = document.querySelector(`#algoPrice${data.id}`);
			console.log('price of the el ---> ',priceEl.textContent, data.price);
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
			document.querySelector(`#algoPrice${response.id}`).textContent = response.price;
			refreshBtn.disabled = false;

		});

	})

}
