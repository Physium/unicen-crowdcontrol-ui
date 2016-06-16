console.log('\'Allo \'Allo!');
google.charts.load('current', { 'packages': ['line', 'corechart'] });
//endpoints
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

var getBatchRunDataInfo = function(id) {
    for (var i = 0; i < batchRunData.length; i++) {
        if (batchRunData[i]['batchId'] == id) {
            return batchRunData[i]['batch'];
        }
    }
    return 'ID not found';
}

var getSingleRunDataInfo = function(id) {
    for (var i = 0; i < singleRunData.length; i++) {
        if (singleRunData[i]['jobId'] == id) {
            return singleRunData[i];
        }
    }
    return 'ID not found';
}

//test add
var startNewSimulation = function(building, location, time, crowd, activatedLift, activatedEscalator, activatedAccess) {
    // A simulation entry.
    var simulationEntry = {
        building: building,
        location: location,
        time: time,
        crowd: crowd,
        activatedLift: activatedLift,
        activatedEscalator: activatedEscalator,
        activatedAccess: activatedAccess
    };

    // Get a key for a new Post.
    var newSimulationKey = firebase.database().ref().child('simulation').push().key;

    // Write the new post's data simultaneously in the posts list and the user's post list.
    var updates = {};
    updates['/simulation/' + newSimulationKey] = simulationEntry;
    updates['/results/' + newSimulationKey] = 'pending';

    return firebase.database().ref().update(updates);
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


//google chart
$(document).ready(function() {
    $('.jumbotron').hide();
    // Query for a booking in 1 day from now, for 2 hours.
    //var start = Date.now() + 24 * 3600 * 1000;
    //var end = start + 2 * 3600 * 1000;
    //var url = 'http://jschallenge.smove.sg/provider/1/availability?book_start=' + start + '&book_end=' + end;

    //APIs Calls
    //console.log test
    $.get(urlStatus, function(data) {
        console.log('hello');
        console.log(data);
    });

    //onclick test
    $('#test').click(function() {
        $.get(urlStatus, function(data) {
            console.log(data);
            $('.jumbotron').show();
            $('.lead').html(data.message + '</b> <p>Connection is working fine</p>');
        });
        setTimeout(function() {
            $('.jumbotron').hide();
        }, 5000);
    });

    //onclick start
    $('#start').click(function() {
        $.get(urlStart, function(data) {
            console.log(data);
            $('.jumbotron').show();
            $('.lead').html(data.message + '</b> <p>Simulation has started</p>');
        });
        setTimeout(function() {
            $('.jumbotron').hide();
        }, 5000);
    });

    //onclick stop
    $('#stop').click(function() {
        $.get(urlStop, function(data) {
            console.log(data);
            $('.jumbotron').show();
            $('.lead').html(data.message + '</b> <p>Simulation has stop</p>');
        });
        setTimeout(function() {
            $('.jumbotron').hide();
        }, 5000);
    });


    //select2 elements
    $('.js-example-basic-single').select2();

    //datetimepicker
    // $('#datetimepicker3').datetimepicker({
    //     format: 'HH:mm'
    // });

    //nav-tab click events
    $('#simulationChartTab').click(function() {
        $('#simulation').load('simulationLineChart.html');
    });
    $('#simulationTableTab').click(function() {
        $('#simulation').load('simulationTable.html');
    });
    $('#simulationEvacuationChartTab').click(function() {
            $('#simulation').load('simulationEvacuationChart.html')
        })
        //initial load
    $('#simulation').load('simulationLineChart.html');

    //form values
    console.log($('#building select').val());
    console.log($('#location').val());
    console.log($('#time input').val());
    console.log($('#crowd select').val());
    console.log($('#floor select').val());
    console.log($('#floor input:checked').val());
    console.log($('#escalator select').val());
    console.log($('#escalator input:checked').val());
    console.log($('#access select').val());
    console.log($('#access input:checked').val());

    //batch submit
    $('#batchRun').click(function() {
        var runs = $('#runs input').val();
        var distribution = $('#distribution select').val();
        var disruption = $('#disruption select').val();
        var strategy = $('#strategy select').val();

        var params = {};
        console.log(distribution);
        params['run'] = parseInt(runs);
        params['Distribution'] = distribution;
        params['Disruption'] = disruption;
        params['Strategy'] = strategy;

        console.log(JSON.stringify(params));
        var jsonOutput = JSON.stringify(params);
        $.ajax({
            method: 'POST',
            url: urlStart,
            //i need to change this to use {config : jsonOutput} instead
            data: { 'config': jsonOutput }
        }).done(function(msg) {
            console.log(msg);

        });
    })

    //submit
    $('#run').click(function() {
        var building = $('#building select').val();
        var location = $('#location select').val();
        var time = $('#time input').val();
        var crowd = $('#crowd select').val();
        var lift = $('#lift select').val();
        var escalator = $('#escalator select').val();
        var access = $('#access select').val();
        var information = $('#information select').val();
        var path = $('#path select').val();

        //var output = '{"building":'+building+',"location":'+location+',"time":'+time+',"crowd":'+crowd+',"activatedLift":'+lift+',"activatedEscalator":'+escalator+',"activatedAccess":'+access+'}';
        //console.log(output);

        var output = {};
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
        /*
        sample parameters request
        {  
            "id":1
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
        }*/

        /*
        sample output
        {
            'id' : 1 //match to 
            "interval":"5",
            results: [
                156,
                239.4,
                324.8,
                343.8,
                349.6,
                357.6,
                384.2,
                413,
                426.4,
                434.4,
                447,
                453.6,
                460.8,
                465,
                471.2,
                480.8,
                489,
                520,
                531.4,
                560.2
            ]
        }
        */
        //optionValues.push($(this).val());
        console.log(JSON.stringify(output));
        var jsonOutput = JSON.stringify(output);
        $.ajax({
            method: 'POST',
            url: urlStart,
            //i need to change this to use {config : jsonOutput} instead
            data: { 'config': jsonOutput }
        }).done(function(msg) {
            console.log(msg);
            //startNewSimulation(building, location, time, crowd, output['activatedLift'], output['activatedEscalator'], output['activatedAccess']);
        });

    });

    // var email = 'wjloh91@gmail.com';
    // var password = '123456'
    // firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    //     // Handle Errors here.
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     // ...
    //     console.log(error);
    // });

    /*$.get("batchresults.json",function(data){
        console.log(data);
        for(var i = 0; i < data.length; i++){
            var row1 = data[i]["batch"][0]["result"];
            var row1Result = JSON.parse(row1);
            $("#batchResults").append("<tr id='"+data[i]["batchId"]+"'><td class='batchId' rowspan='2'>"+data[i]["batchId"]+"</td><td class='progress' rowspan='2'>100%</td><td class='instanceid'>"+data[i]["batch"][0]["instanceId"]+"</td><td class='instanceState'>"+data[i]["batch"][0]["instanceState"]+"</td><td></td></tr>");
            for(var j = 1; j < data[i]["batch"].length; j++){
                console.log(data[i]["batch"].length);
                $("#batchResults").append("<tr><td class='instanceid'>"+data[i]["batch"][j]["instanceId"]+"</td><td class='instanceState'>"+data[i]["batch"][j]["instanceState"]+"</td><td style='word-wrap:break-word'>"+row1Result["results"]+"</td></tr>");
            }
        }
    });*/

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

    var averageResult = function(batch) {
        var finalArr = [];
        var parseResult = JSON.parse(batch[0]['result']);
        if (parseResult != null) {
            for (var i = 0; i < parseResult['results'].length; i++) {
                var temp = 0;
                for (var j = 0; j < batch.length; j++) {
                    var parseTempResult = JSON.parse(batch[j]['result']);
                    if (parseTempResult != null) {
                        console.log(parseTempResult)
                        temp = temp + parseTempResult['results'][i];
                    }
                }
                finalArr.push(temp / batch.length)
            }
        }
        return finalArr;
    };

    $.get(urlBatchRunData, function(data) {
        console.log(data);
        batchRunData = data;
        for (var i = 0; i < data.length; i++) {
            var batchId = data[i]["batchId"];
            var runs = data[i]["runs"]
            var progress = currentProgress(data[i]["batch"], runs);
            var avgResults = averageResult(data[i]["batch"]);


            var row1 = data[i]["batch"][0]["result"];
            var row1Result = JSON.parse(row1);
            $("#batchResults").append("<tr id='" + batchId + "'>" +
                "<td class='batchId'>" + batchId + "</td><td class='progress'>" + Math.round(progress) + "%</td>" +
                "<td class='runs'>" + runs + "</td><td><button id='result' data-toggle='modal' data-id='" + batchId + "' data-target='#resultsModal' class='btn btn-sm btn-success'>View Results</button></td>" +
                "<td> <button data-toggle='modal' data-id='" + batchId + "' data-target='#myModal' class='btn btn-sm btn-success'>View</button></td></tr>");

            /*console.log(avgResults.length);
            for(var j = 0; j < avgResults.length; j++){
                console.log(batchId);
                $("#"+batchId+" .avgRes").append("<li>"+avgResults[j]+"</li>");
            }*/
        }
    });



    $.get(urlSingleRunData, function(data) {
        singleRunData = data;

        $('#simChoiceSubmit').click(function() {
            var selectedJobId = $('#simChoice').val();
            for (var i = 0; i < singleRunData.length; i++) {
                if (singleRunData[i]['jobId'] == selectedJobId) {
                    simChartData.push(singleRunData[i]);
                }
            }
            console.log('hello');
            console.log(simChartData);
        });

        function singleRunList() {
            var res = [];
            //console.log(singleRunData);
            for (var i = 0; i < data.length; i++) {
                var temp = {
                    id: data[i]['jobId'],
                    text: data[i]['jobId']
                }
                console.log(temp);
                res.push(temp);
            }
            return res;
        }

        $('#simChoice').select2({
            data: singleRunList()
        })

        console.log(data);

        for (var i = 0; i < data.length; i++) {
            var jobId = data[i]["jobId"];
            var instanceId = data[i]["instanceId"];
            var instanceState = data[i]["instanceState"];
            var result = JSON.parse(data[i]["result"])["results"];


            //var progress = currentProgress(data[i]["batch"],runs);
            //var avgResults = averageResult(data[i]["batch"]);


            //var row1 = data[i]["batch"][0]["result"];
            //var row1Result = JSON.parse(row1);
            $("#singleResults").append("<tr id='" + jobId + "'>" +
                "<td class='jobId'>" + jobId + "</td><td class='instanceId'>" + instanceId + "</td>" +
                "<td class='instanceState'>" + instanceState + "</td><td><button id='result' data-toggle='modal' data-id='" + jobId + "' data-target='#singleResultsModal' class='btn btn-sm btn-success'>View Results</button></td>" +
                "<td> <button data-toggle='modal' data-id='" + jobId + "' data-target='#singleParamModal' class='btn btn-sm btn-success'>View</button></td></tr>");

            /*console.log(avgResults.length);
            for(var j = 0; j < avgResults.length; j++){
                console.log(batchId);
                $("#"+batchId+" .avgRes").append("<li>"+avgResults[j]+"</li>");
            }*/
        }
    });
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

    $('#singleResultsModal').on('show.bs.modal', function(event) {

        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var button = $(event.relatedTarget);
            var jobId = button.data('id');
            var singleArr = getSingleRunDataInfo(jobId);
            var result = JSON.parse(singleArr["result"])["results"];
            console.log(result);

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Percentile');
            data.addColumn('number', jobId);
            var output = [];
            //console.log(result);
            for (var i = 0; i < result.length; i++) {
                //console.log(result['results'][i]);
                var arr = [];
                //console.log(result);
                arr.push((i + 1) * 5);
                arr.push(result[i]);
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

            var chart = new google.visualization.LineChart(document.getElementById('singleResultsModalChart'));

            chart.draw(data, options);
        }
    });

    $('#singleParamModal').on('show.bs.modal', function(event) {

        var button = $(event.relatedTarget);
        var jobId = button.data('id');
        var singleArr = getSingleRunDataInfo(jobId);
        var parameter = JSON.parse(singleArr["parameter"])

        var building = parameter['building'];
        var location = parameter['location'];
        var time = parameter['time'];
        var crowd = parameter['crowd'];
        var information = parameter['information'];
        var path = parameter['path'];
        var activatedLift = parameter['activatedLift'];
        var activatedEscalator = parameter['activatedEscalator'];
        var activatedAccess = parameter['activatedAccess'];

        var modal = $(this);
        modal.find('.modal-body').html("<div><label> Buidling </label> : " + building + "</div>" +
            "<div><label> Location </label> : " + location + "</div>" +
            "<div><label> Time </label> : " + time + "</div>" +
            "<div><label> Crowd </label> : " + crowd + "</div>" +
            "<div><label> Information </label> : " + information + "</div>" +
            "<div><label> Path </label> : " + path + "</div>");

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

    // $('#table-result').bootstrapTable({
    //     url: '353.json',
    //     columns: [{
    //         field: 'date',
    //         title: 'Date Stamp',
    //         sortable: true
    //     }, {
    //         field: 'm_type',
    //         title: 'Type',
    //         sortable: true
    //     }, {
    //         field: 'msdn',
    //         title: 'MSDN',
    //         sortable: true
    //     }, {
    //         field: 'file_name',
    //         title: 'File Name',
    //         sortable: true
    //     }, {
    //         field: 'message',
    //         title: 'Message',
    //         sortable: true
    //     }],
    //     responseHandler: function(res) {
    //         console.log(res);
    //         return res.messages;
    //     }
    // });


    /*$.get("batchresults.json",function(data){
        $("#batchResult").bootstrapTable({
            data: data,
        });
    });*/
    // console.log(new Firebase('https://docs-examples.firebaseio.com/web/data'));
    /*database.ref('simulation').once('value').then(function(snapshot){
            console.log(snapshot.val());
    });*/



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
    // return [
    //     '<a class="like" href="javascript:void(0)" title="Like">',
    //         '<i class="glyphicon glyphicon-heart"></i>',
    //     '</a>',
    //     '<a class="edit ml10" href="javascript:void(0)" title="Edit">',
    //         '<i class="glyphicon glyphicon-edit"></i>',
    //     '</a>',
    //     '<a class="remove ml10" href="javascript:void(0)" title="Remove">',
    //         '<i class="glyphicon glyphicon-remove"></i>',
    //     '</a>'
    // ].join('');
    console.log(value);
    console.log(row);
    console.log(index);
    return 'Results'
}

function test(value){
    console.log(value)
    return'<div class="dashboard-stat2"><div class="progress-info">'+
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
        alert('You click like icon, row: ' + JSON.stringify(row));
        console.log(value, row, index);
    },
    'click .edit': function (e, value, row, index) {
        alert('You click edit icon, row: ' + JSON.stringify(row));
        console.log(value, row, index);
    },
    'click .remove': function (e, value, row, index) {
        alert('You click remove icon, row: ' + JSON.stringify(row));
        console.log(value, row, index);
    }
};

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