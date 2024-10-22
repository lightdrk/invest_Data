//document.getElementsByClassName('main-ctr')[0].innerHTML += ``;


let btnDetails = document.getElementById('gh');
let btnGraph = document.getElementById('gold');
console.log(btnDetails.innerText);
btnDetails.addEventListener("click", () => {
	btnDetails = document.getElementById('gh');
	btnGraph = document.getElementById('gold');

	if ((btnDetails.innerText).includes("↑")){
		btnDetails.innerText = "Graph ↓";
		btnGraph.classList.remove("hide");
	}else {
		btnDetails.innerText = "Graph ↑";
		btnGraph.classList.add("hide");
	}
});

const xValues = [50,60,70,80,90,100,110,120,130,140,150];
const yValues = [7,8,8,9,9,9,10,11,14,14,15];

new Chart("gold", {
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


function addIn(url,callback) {
	const db_url = "http://localhost:5000/api/add";
	fetch(db_url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({url}) 
	}).then(response => {
		if (!response.ok){
			throw new Error(response);
			console.log('custom  -->',response);
			callback(response)
		}
		return response.json();
	}).then(data => {
		callback(data);
	}).catch((error) => {
		console.log(error);
		callback(error);
		console.error(error);

	});
}


document.getElementById('add').addEventListener('click', ()=>{
	let toAdd = document.getElementById("url").value;
	console.log(toAdd);
	toAdd = toAdd.trim();
	if (toAdd.length > 24){
		if (toAdd.includes('investing.com')){
			addIn(toAdd, (check) => {
				console.log(check);
				if (check.status === 'success'){
					console.log('Added');
					document.getElementById("url").classList.add('success');
					setTimeout(()=>{
						document.getElementById("url").classList.remove('success');
						document.getElementById("url").value = '';
					},500);

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

			return response.json();
		}).then(data => {
			callback(data);
			console.log(data);
		}).catch((error) => {
			console.log(error);
			console.error(error);
	});
	return data;
}

setInterval(() => {
	update({'a':'a'},(data)=>{
		console.log(data);
	});
},5000);

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
historyBtns.forEach((historyBtn)=>{
		historyBtn.addEventListener("click", ()=>{
			console.log("searching history")	
		})

});

