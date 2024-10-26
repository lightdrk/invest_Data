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
					<p>price:</p>
					<p1 id="${perCtr.Name}-${perCtr.Id}">15785</p1>
					<button class="refresh"><i class="fa fa-refresh" style="font-size:20px"></i></button>
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
								<th>Time</th>
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
				xValues.push(`${graphData[i].Date} ${graphData[i].Time}`);
				yValues.push(graphData[i].AlgoPrice);
			}

			let chart = new Chart(btnGraph.id, {
			  type: "line",
			  data: {
			    labels: xValues,
			    datasets: [{
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
			      yAxes: [{ticks: {min: 6, max:16}}],
			    }
			  }
			});
			//
			//switch changing data from algo price to real price;
			//
			console.log('*******', parseInt(parentCtr.id));
			let fromLocal = JSON.parse(localStorage.getItem('RealPrice'));
			let newXValues = [];
			let newYValues = [];
			for (let i=fromLocal.length-1; i >= 0; i--){
				newXValues.push(`${graphData[i].Date} ${graphData[i].Time}`);
				newYValues.push(graphData[i].RealPrice);
			}

			let switchs = document.getElementById(`${parseInt(parentCtr.id)}mySwitch`);
			switchs.addEventListener('change',(event) =>{
				if (event.target.checked) {
					console.log('changed');
					chart.data.labels = newXValues;//realPrice data
					chart.data.datasets[0].data = newYValues;
					chart.update();
				}else {
					///TODO: check may be issue here
					chart.data.labels = xValues ;//AlgoPrice data
					chart.data.datasets[0].data = yValues;
					chart.update();

				}


			});
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

	// this logic does the updation on specific time

	function update(ids,callback) {
		const db_url = "http://localhost:5000/api/update";
		let data = fetch(db_url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(ids) 
			}).then(response => {
				if (!response.ok){
					throw new Error(response);
					console.log('custom  -->',response);
				}

				return response.json().then(data => {
					callback(data);
				});
			}).catch((error) => {
				console.log(error);
				console.error(error);
			});
	}

	setInterval(() => {
		update({'a':'a'},(data)=>{
			console.log(data);
		});
	},500000);

	document.getElementsByClassName('fa-refresh')[0].addEventListener("mouseover", ()=>{
		let refresh = document.getElementsByClassName('fa-refresh');
		refresh[0].classList.add('fa-spin');
	});

	document.getElementsByClassName('fa-refresh')[0].addEventListener("mouseout", ()=>{
		let refresh = document.getElementsByClassName('fa-refresh');
		refresh[0].classList.remove('fa-spin');
	});

	document.getElementsByClassName('fa-history')[0].addEventListener("mouseover", ()=>{
		let history = document.getElementsByClassName('fa-history');
		history[0].classList.add('fa-spin');
	});

	document.getElementsByClassName('fa-history')[0].addEventListener("mouseout", ()=>{
		let history = document.getElementsByClassName('fa-history');
		history[0].classList.remove('fa-spin');
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
					<td>${column.Time}</td>
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
}
