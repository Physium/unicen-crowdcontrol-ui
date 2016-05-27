console.log('\'Allo \'Allo!');
google.charts.load('current', {'packages':['line','corechart']});
var urlStatus = 'http://unicern-rpc-03:8080/SimulatorControl/?command=status';
var urlStart = 'http://unicern-rpc-03:8080/SimulatorControl/?command=start';
var urlStop = 'http://unicern-rpc-03:8080/SimulatorControl/?command=stop';
var urlData = 'http://unicern-rpc-03:8080/SimulatorControl/?command=getPercentileData';
//10.1.12.68


//google chart
$(document).ready(function(){
	$('.jumbotron').hide();
	// Query for a booking in 1 day from now, for 2 hours.
	//var start = Date.now() + 24 * 3600 * 1000;
	//var end = start + 2 * 3600 * 1000;
	//var url = 'http://jschallenge.smove.sg/provider/1/availability?book_start=' + start + '&book_end=' + end;

	//APIs Calls
	//console.log test
	$.get(urlStatus, function(data){
		console.log('hello');
		console.log(data);
	});
	
	//onclick test
	$("#test").click(function() {
		$.get(urlStatus, function(data){
			console.log(data);
			$('.jumbotron').show();
			$('.lead').html(data.message+'</b> <p>Connection is working fine</p>');
		});
		setTimeout(function(){
			$('.jumbotron').hide();
		},5000);
	});
	
	//onclick start
	$("#start").click(function (){
		$.get(urlStart, function(data){
			console.log(data);
			$('.jumbotron').show();
			$('.lead').html(data.message+'</b> <p>Simulation has started</p>');
		});
		setTimeout(function(){
			$('.jumbotron').hide();
		},5000);
	});

	//onclick stop
	$("#stop").click(function (){
		$.get(urlStop, function(data){
			console.log(data);
			$('.jumbotron').show();
			$('.lead').html(data.message+'</b> <p>Simulation has stop</p>');
		});
		setTimeout(function(){
			$('.jumbotron').hide();
		},5000);
	});

	//END APIs Calls
	//select2 elements
	$(".js-example-basic-single").select2();

	//datetimepicker
	$("#datetimepicker3").datetimepicker({
        format: 'HH:mm'
    });

	//nav-tab click events
	$("#simulationChartTab").click(function(){
		$('#simulation').load("simulationLineChart.html");
	});
	$("#simulationTableTab").click(function(){
		$('#simulation').load("simulationTable.html");
	});
	$("#simulationEvacuationChartTab").click(function(){
		$('#simulation').load("simulationEvacuationChart.html")
	})
	//initial load
	$("#simulation").load("simulationLineChart.html");

	//form values
	console.log($("#building select").val());
	console.log($("#location").val());
	console.log($("#time input").val());
	console.log($("#crowd select").val());
	console.log($("#floor select").val());
	console.log($("#floor input:checked").val());
	console.log($("#escalator select").val());
	console.log($("#escalator input:checked").val());
    console.log($("#access select").val());
    console.log($("#access input:checked").val());

    //submit
    $("#run").click(function(){
	    var building = $("#building select").val();
		var location = $("#location select").val();
		var time = $("#time input").val();
		var crowd = $("#crowd select").val();
		var lift = $("#lift select").val();
		var escalator = $("#escalator select").val();
	    var access = $("#access select").val();
	    var information = $("#information select").val();
	    var path = $("#path select").val();

	    //var output = '{"building":'+building+',"location":'+location+',"time":'+time+',"crowd":'+crowd+',"activatedLift":'+lift+',"activatedEscalator":'+escalator+',"acticatedAccess":'+access+'}';
	    //console.log(output);

	    var output = {};
	    output["building"] = building;
	    output["location"] = location;
	    output["time"] = time;
	    output["crowd"] = crowd;
	    output["information"] = information;
	    output["path"] = path;
	    output["activatedLift"] = [];
	    output["activatedEscalator"] = [];
	    output["activatedAccess"] = [];
	    $("#escalator option").each(function() {
	    	console.log($(this).val());
	    	if(escalator){
		    	if(escalator.indexOf($(this).val()) == -1){
		    		output["activatedEscalator"].push($(this).val());
		    	}
	    	}else{
	    		output["activatedEscalator"].push($(this).val());
	    	}
		});

		$("#lift option").each(function() {
	    	//console.log($(this).val());
	    	if(lift){
		    	if(lift.indexOf($(this).val()) == -1){
		    		output["activatedLift"].push($(this).val());
		    	}
	    	}else{
	    		output["activatedLift"].push($(this).val());
	    	}
		});

		$("#access option").each(function() {
	    	//console.log($(this).val());
	    	if(access){
		    	if(access.indexOf($(this).val()) == -1){
		    		output["activatedAccess"].push($(this).val());
		    	}
	    	}else{
	    		output["activatedAccess"].push($(this).val());
	    	}
		});
		    //optionValues.push($(this).val());
	    /*
	    sample output
	    {  
		   "building":"SUNTEC-EXH",
		   "location":"601-602",
		   "time":"00:00",
		   "crowd":"RANDOM",
		   "activatedLift":[  
		      "Lift 2 @ Floor 0",
		      "Lift 3 @ Floor 0"
		   ],
		   "activatedEscalator":[  
		      "Stair id 2 @ level 1"
		   ],
		   "activatedAccess":[  
		      "Door 0",
		      "Door 1"
		   ]
		}
	    */
	    console.log(JSON.stringify(output));
	    var jsonOutput = JSON.stringify(output);
	    $.ajax({
	    	method:"POST",
	    	url:urlStart,
	    	data: jsonOutput
	    }).done(function(msg){	
	   		console.log(msg);
	    });
    });
})