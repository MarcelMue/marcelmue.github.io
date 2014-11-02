//d3 stuff
var	margin = {top: 40, right: 20, bottom: 40, left: 40},
	width = 600 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom,

	//variables which are supposed to be altered
	teams = ["",""],
	h2hcsv = "",
	team0csv = "",
	team1csv = "",

	//datafield that is object to change
	data= {winrate:[0,0], winrate10:[0,0], winrateAll:[0,0], winrateAll10:[0,0]},
	names = ["All head to head games","Last 10 head to head games","All games played", "Last 10 games played"];

//svg
var svg = d3.select(".graph").insert("svg")
	.attr("width",width + margin.left + margin.right)
	.attr("height",height + margin.top + margin.bottom)
	.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//axis
var x0 = d3.scale.ordinal()
    .rangeRoundBands([0, width], .1);

var x1 = d3.scale.ordinal();

var y = d3.scale.linear()
    .range([height, 0]);

var xAxis = d3.svg.axis()
    .scale(x0)
    .orient("bottom");


var yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickFormat(d3.format("%"));

//color
var color = d3.scale.ordinal()
    .range(["#98abc5",  "#7b6888",  "#a05d56",  "#ff8c00"]);
//interaction
labels = ["C9 Vs NaVi", "C9 Vs Alliance", "Alliance Vs NaVi"];
options = [0, 1, 2];
d3.select("#drop")
    .append("select")
    .selectAll("option")
    .data(options)
    .enter()
    .append("option")
    .text(function(d) {return labels[d];});
d3.select('select')
    .on("change", function() {
    	if(this.selectedIndex == 0){
    		redoGraph("C9","NaVi");
    	}
    	if(this.selectedIndex == 1){
    		redoGraph("Alliance","C9");
    	}
    	if(this.selectedIndex == 2){
    		redoGraph("Alliance","NaVi");
    	}
    });

//read first csv
function redoGraph(team0,team1){
	teams[0] = team0;
	teams[1] = team1;
	h2hcsv = team0 + "_" + team1 + "_H2H.csv";
	team0csv = team0 + "Games.csv";
	team1csv = team1 + "Games.csv";
	d3.selectAll(".legend").remove();
	d3.selectAll(".g").remove();
	d3.selectAll(".axis").remove();
	d3.csv(h2hcsv).get(function(error, rows){
		calcH2H(rows);
	});
}


//draw bars
function draw(){
	//redefenition of the datafield to be more usefull, very dirty / bad
	var rdata = [
	{Name:names[0]},
	{Name:names[1]},
	{Name:names[2]},
	{Name:names[3]},
	];
	rdata[0][teams[0]] = data.winrate[0];
	rdata[1][teams[0]] = data.winrate10[0];
	rdata[2][teams[0]] = data.winrateAll[0];
	rdata[3][teams[0]] = data.winrateAll10[0];
	rdata[0][teams[1]] = data.winrate[1];
	rdata[1][teams[1]] = data.winrate10[1];
	rdata[2][teams[1]] = data.winrateAll[1];
	rdata[3][teams[1]] = data.winrateAll10[1];

	//legend
	var legend = svg.selectAll(".legend")
	    .data(teams)
	  .enter().append("g")
	    .attr("class", "legend")
	    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	legend.append("rect")
	    .attr("x", width - 18)
	    .attr("width", 18)
	    .attr("height", 18)
	    .style("fill", color);

	legend.append("text")
	    .attr("x", width - 24)
	    .attr("y", 9)
	    .attr("dy", ".35em")
	    .style("text-anchor", "end")
	    .text(function(d) { return d; });

	rdata.forEach(function(d) {
	  d.ages = teams.map(function(name) { return {name: name, value: +d[name]}; });
	});


	x0.domain(rdata.map(function(d) {return d.Name;}));
	x1.domain(teams).rangeRoundBands([0, x0.rangeBand()]);
	y.domain([0, 1]);

	svg.append("g")
	    .attr("class", "x axis")
	    .attr("transform", "translate(0," + height + ")")
	    .call(xAxis);

	svg.append("g")
	    .attr("class", "y axis")
	    .call(yAxis)
	  	.append("text")
	      	.attr("transform", "rotate(-90)")
	      	.attr("y", 6)
	      	.attr("dy", ".71em")
	      	.style("text-anchor", "end")
	      	.text("Winrate");

	var perc = svg.selectAll(".perc")
	      .data(rdata)
	    .enter().append("g")
	      .attr("class", "g")
	      .attr("transform", function(d) { return "translate(" + x0(d.Name) + ",0)"; });
	perc.selectAll("rect")
      .data(function(d) {return d.ages; })
    .enter().append("rect")
      .attr("width", x1.rangeBand())
      .attr("x", function(d) { return x1(d.name); })
      .attr("y", function(d) { return y(d.value); })
      .attr("height", function(d) { return height - y(d.value); })
      .style("fill", function(d) { return color(d.name); });

}


function calcH2H(rows){
	//filtering information out of the H2H csv file
	var team0Wins = 0;
	var team1Wins = 0;
	var team0Wins10 = 0;
	var team1Wins10 = 0;
	var numberOfGames = rows.length;
	for(i = 0; i < rows.length; i++){

		if(rows[i].Winner.toLowerCase() == "dire"){
			if(rows[i].Dire == teams[0]){
				team0Wins ++;
				if(i<10){
					team0Wins10 ++;
				}
			}else{
				team1Wins ++;
				if(i<10){
					team1Wins10 ++;
				}
			}
		}else{
			if(rows[i].Radiant == teams[0]){
				team0Wins ++;
				if(i<10){
					team0Wins10 ++;
				}
			}else{
				team1Wins ++;
				if(i<10){
					team1Wins10 ++;
				}
			}
		}
	}
	if(rows.length <= 10){
		data.winrate10[0] = team0Wins10/rows.length;
		data.winrate10[1] = team1Wins10/rows.length;
	}else{
		data.winrate10[0] = team0Wins10/10;
		data.winrate10[1] = team1Wins10/10;
	}
	data.winrate[0] = (team0Wins/numberOfGames);
	data.winrate[1] = (team1Wins/numberOfGames);
	d3.csv(team0csv).get(function(error, rows){
		calcteam(rows,0);
		d3.csv(team1csv).get(function(error, rows){
			calcteam(rows,1);
			draw();
		})
	});
}


function calcteam (rows,t){
	//gathering information out of the team csv files
	var allwins =0;
	var wins10 = 0;
	var numberOfGames = rows.length;
	for(i = 0; i < rows.length; i++){
		if(rows[i].Winner.toLowerCase() == "dire"){
			if(rows[i].Dire == teams[t]){
				allwins ++;
				if(i<10){
					wins10 ++;
				}
			}
		}else{
			if(rows[i].Radiant == teams[t]){
				allwins ++;
				if(i<10){
					wins10 ++;
				}
			}
		}
	}
	if(rows.length <= 10){
		data.winrateAll10[t] = wins10/rows.length;
	}else{
		data.winrateAll10[t] = wins10/10;
	}
	data.winrateAll[t] = (allwins/numberOfGames);
}


redoGraph("C9","NaVi");