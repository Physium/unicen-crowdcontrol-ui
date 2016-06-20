//google chart load
google.charts.load('current', { 'packages': ['line', 'corechart'] });

//list of endpoints
var ipAddress = '10.1.20.70:8080'; //10.1.12.68
var urlStatus = 'http://' + ipAddress + '/SimulatorControl/?command=status';
var urlStart = 'http://' + ipAddress + '/SimulatorControl/?command=start';
var urlStop = 'http://' + ipAddress + '/SimulatorControl/?command=urlStop';
var urlData = 'http://' + ipAddress + '/SimulatorControl/?command=getPercentileData';
var urlSingleRunData = 'http://' + ipAddress + '/SimulatorControl/?command=getAllSingleRunData';
var urlBatchRunData = 'http://' + ipAddress + '/SimulatorControl/?command=getAllBatchRunData';

//global variable
var batchRunData;
var singleRunData;
var simChartData = [];
simChartData.push();
//chart variable
var chart;
var data;
var options;

//obtain individual batch run data base on store global
var getBatchRunDataInfo = function(id) {
    for (var i = 0; i < batchRunData.length; i++) {
        if (batchRunData[i]['batchId'] == id) {
            return batchRunData[i]['batch'];
        }
    }
    return 'ID not found';
}

//obtain single run data base on store global
var getSingleRunDataInfo = function(id) {
    for (var i = 0; i < singleRunData.length; i++) {
        if (singleRunData[i]['jobId'] == id) {
            return singleRunData[i];
        }
    }
    return 'ID not found';
}


// function to update the chart with new data.
function updateChart() {

    dataTable = new google.visualization.DataTable();

    var newData = [
        ['Year', 'Sales', 'Expenses', 'Other'],
        ['2004', 1000, 400, 232],
        ['2005', 1170, 460, 421],
        ['2006', 660, 1120, 4324],
        ['2007', 1030, 540, 4234],
        ['2008', 1530, 50, 234]
    ];

    // determine the number of rows and columns.
    var numRows = newData.length;
    var numCols = newData[0].length;

    // in this case the first column is of type 'string'.
    dataTable.addColumn('string', newData[0][0]);

    // all other columns are of type 'number'.
    for (var i = 1; i < numCols; i++)
        dataTable.addColumn('number', newData[0][i]);

    // now add the rows.
    for (var i = 1; i < numRows; i++)
        dataTable.addRow(newData[i]);

    // redraw the chart.
    chart.draw(dataTable, options);

}

//changes params
$('#run input').on("change",function(){
    var noOfRuns = $(this).val();
    if(noOfRuns > 1){
        $('#batchRunParams').show();
        $('#singleRunParams').hide();
    }else{
        $('#batchRunParams').hide();
        $('#singleRunParams').show();
    }
})
//simulation submit
$('#simulationSubmit').click(function(){

    //obtaining input variables
    //Single params
    var building = $('#building select').val();
    var run = $('#run input').val();
    var location = $('#location select').val();
    var time = $('#time input').val();
    var crowd = $('#crowd select').val();
    var lift = $('#lift select').val();
    var escalator = $('#escalator select').val();
    var access = $('#access select').val();
    var information = $('#information select').val();
    var path = $('#path select').val();
    //Batch params
    var distribution = $('#distribution select').val();
    var disruption = $('#disruption select').val();
    var strategy = $('#strategy select').val();
    //
    var output = {};
    

    //test output printout
    console.log(JSON.stringify(output));
    if(run > 1){
        output['run'] = parseInt(run);
        output['Distribution'] = distribution;
        output['Disruption'] = disruption;
        output['Strategy'] = strategy;


    }else{
        output['building'] = building;
        output['location'] = location;
        output['time'] = time;
        output['crowd'] = crowd;
        output['information'] = information;
        output['path'] = path;
        output['activatedLift'] = [];
        output['activatedEscalator'] = [];
        output['activatedAccess'] = [];
        $('#escalator option').each(function() {
            console.log($(this).val());
            if (escalator) {
                if (escalator.indexOf($(this).val()) == -1) {
                    output['activatedEscalator'].push($(this).val());
                }
            } else {
                output['activatedEscalator'].push($(this).val());
            }
        });

        $('#lift option').each(function() {
            //console.log($(this).val());
            if (lift) {
                if (lift.indexOf($(this).val()) == -1) {
                    output['activatedLift'].push($(this).val());
                }
            } else {
                output['activatedLift'].push($(this).val());
            }
        });

        $('#access option').each(function() {
            //console.log($(this).val());
            if (access) {
                if (access.indexOf($(this).val()) == -1) {
                    output['activatedAccess'].push($(this).val());
                }
            } else {
                output['activatedAccess'].push($(this).val());
            }
        });
        
    }
    console.log(output);
    var jsonOutput = JSON.stringify(output);
    $.ajax({
        method: 'POST',
        url: urlStart,
        data: { 'config': jsonOutput }
    }).done(function(msg) {
        //Show that this is done
        console.log(msg);
    });
});

var averageResult = function(batch) {
    var finalArr = [];
    var parseResult = JSON.parse(batch[0]['result']);
    if (parseResult != null) {
        for (var i = 0; i < parseResult['results'].length; i++) {
            var temp = 0;
            for (var j = 0; j < batch.length; j++) {
                var parseTempResult = JSON.parse(batch[j]['result']);
                if (parseTempResult != null) {
                    //console.log(parseTempResult)
                    temp = temp + parseTempResult['results'][i];
                }
            }
            finalArr.push(temp / batch.length)
        }
    }
    return finalArr;
};

$(document).ready(function() {

    //select2 elements
    $('.js-example-basic-single').select2();

    //initial load
    $('#simulation').load('simulationEvacuationChart.html');
    
    //hide batch run params
    $('#batchRunParams').hide();

    //THIS IS HISTORY PAGE
    var currentProgress = function(batch, runs) {
        var currentProgress = 0;
        var countFinishRuns = batch.length;
        if (batch.length > 0) {
            for (var i = 0; i < batch.length; i++) {
                if (batch[i]['instanceState'] == 'FINISHED') {
                    currentProgress = currentProgress + 1;
                }
            }
        }
        //console.log(currentProgress)
        return (currentProgress / runs) * 100;
    };

    

    $('#resultsModal').on('show.bs.modal', function(event) {

        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var button = $(event.relatedTarget);
            var batchId = button.data('id');
            var batchArr = getBatchRunDataInfo(batchId);
            console.log(batchId);
            var avgResults = averageResult(batchArr);
            console.log(avgResults)

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Percentile');
            data.addColumn('number', batchId);
            var output = [];
            //console.log(result);
            for (var i = 0; i < avgResults.length; i++) {
                //console.log(result['results'][i]);
                var arr = [];
                //console.log(result);
                arr.push((i + 1) * 5);
                arr.push(avgResults[i]);
                //console.log(arr);
                output.push(arr);
            }
            data.addRows(output);

            var options = {
                title: 'Evacuation Time of Crowd',
                width: '100%',
                height: '400',
                legend: 'none',
                vAxis: {
                    title: 'Evacuation Time (sec)',

                },
                hAxis: {
                    title: 'Percentile'
                },
                chartArea: {
                    left: '25%',
                }
            };

            var chart = new google.visualization.LineChart(document.getElementById('resultsModalChart'));

            chart.draw(data, options);
        }
    });

    $('#myModal').on('show.bs.modal', function(event) {
        var button = $(event.relatedTarget);
        var batchId = button.data('id');
        var batchArr = getBatchRunDataInfo(batchId);

        var modal = $(this);

        modal.find('.modal-body').html("<table id='instanceTable' style='table-layout:fixed' class='table table-bordered'>" +
            "<tr><th>Job ID</th><th>Instance ID</th><th>Instance State</th></tr>" + "</table>");
        for (var i = 0; i < batchArr.length; i++) {
            var jobId = batchArr[i]['jobId'];
            var instanceId = batchArr[i]['instanceId'];
            var instanceState = batchArr[i]['instanceState'];
            modal.find('#instanceTable').append("<tr><td>" + jobId + "</td><<td>" + instanceId + "</td><td>" + instanceState + "</td></tr>")

        }


    });

    $.get(urlBatchRunData,function(data){
        console.log(data);
        batchRunData = data;
    })

})


var currentProgress = function(batch, runs) {
    var currentProgress = 0;
    var countFinishRuns = batch.length;
    if (batch.length > 0) {
        for (var i = 0; i < batch.length; i++) {
            if (batch[i]['instanceState'] == 'FINISHED') {
                currentProgress = currentProgress + 1;
            }
        }
    }
    //console.log(currentProgress)
    return (currentProgress / runs) * 100;
};

function operateFormatter(value, row, index) {
    return [
        '<a data-toggle="modal" data-id="'+row['batchId']+'" data-target="#resultsModal" class="like ml10" title="Results">',
            '<i class="fa fa-bar-chart-o"></i>',
        '</a>',
        '<a data-toggle="modal" data-id="'+row['batchId']+'" data-target="#myModal" class="like ml10" title="Results">',
            '<i class="fa fa-search"></i>',
        '</a>',
        '<a class="edit ml10" href="javascript:void(0)" title="Compare">',
            '<i class="fa fa-plus"></i>',
        '</a>'
    ].join('');
    // console.log(value);
    // console.log(row);
    // console.log(index);
    // return 'Results'
}

function test(value){
    console.log(value)
    return'<div class="dashboard-stat2" style="background:none;padding:0;"><div class="progress-info">'+
                        '<div class="progress">'+
                            '<span style="width: '+value+'%;" class="progress-bar progress-bar-success green-sharp">'+
                                '<span class="sr-only">'+value+'% progress</span>'+
                            '</span>'+
                        '</div>'+
                        '<div class="status">'+
                            '<div class="status-title"> progress </div>'+
                                '<div class="status-number">'+value+'% </div>'+
                        '</div>'+
                    '</div></div>';
    //return testValue;
}

window.operateEvents = {
    'click .like': function (e, value, row, index) {
        //alert('You click like icon, row: ' + JSON.stringify(row));
        console.log(value, row, index);
    },
    'click .edit': function (e, value, row, index) {
        // alert('You click edit icon, row: ' + JSON.stringify(row));
        // console.log(value, row, index);
        console.log(row['batchId']);
        var selectedId = row['batchId'];
        for (var i = 0; i < batchRunData.length; i++) {
            if (batchRunData[i]['batchId'] == selectedId) {
                //var avgResults = averageResult(batchRunData[i]['batchId']);
                var batchArr = getBatchRunDataInfo(batchRunData[i]['batchId']);
                //console.log(batchId);
                var avgResults = averageResult(batchArr);
                batchArr['results'] = avgResults;
                batchArr['batchId'] = batchRunData[i]['batchId'];
                simChartData.push(batchArr);

                console.log(batchArr);
            }
        }
        console.log(simChartData);
        
        drawChart();
    }

};

$('#clearSimulator').click(function(){

    simChartData = [];
    $("#simulationEvacuationChart").html("<h1>No simulations results</h1>");
})

function responseHandler(res){
    var final = [];
    for(var i = 0; i < res.length; i++){
        var temp = {};
        temp['batchId'] = res[i]['batchId'];
        temp['runs'] = res[i]['runs'];
        temp['progress'] = currentProgress(res[i]['batch'],res[i]['runs']);
        final.push(temp);
    }
    return final;
};

//draw the evacuation chart for comparison
function drawChart() {
    data = new google.visualization.DataTable();
    data.addColumn('number', 'Percentile');
    console.log(simChartData);
    for (var i = 0; i < simChartData.length; i++) {
        data.addColumn('number', 'ID ' + simChartData[i]['batchId']);
    }


    //obtain all results
    var output = [];
    for (var i = 0; i < simChartData[0]['results'].length; i++) {
        var arr = [];
        arr.push((i + 1) * 5);
        for (var j = 0; j < simChartData.length; j++) {
            arr.push(simChartData[j]['results'][i]);
        }

        output.push(arr);
    }

    data.addRows(output);

    options = {
        title: 'Evacuation Time of Crowd',
        vAxis: {
            title: 'Evacuation Time (sec)',

        },
        hAxis: {
            title: 'Percentile'
        },
        chartArea: {
            width: '50%'
        }
    };

    chart = new google.visualization.LineChart(document.getElementById('simulationEvacuationChart'));

    chart.draw(data, options);
}

