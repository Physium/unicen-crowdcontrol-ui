//initialization of Google Chart
google.charts.load('current', { 'packages': ['line', 'corechart'] });

//

//List of Endpoints
var ipAddress = '10.1.20.70:8080'; //10.1.12.68
var urlStatus = 'http://' + ipAddress + '/SimulatorControl/?command=status';
var urlStart = 'http://' + ipAddress + '/SimulatorControl/?command=start';
var urlStop = 'http://' + ipAddress + '/SimulatorControl/?command=urlStop';
var urlData = 'http://' + ipAddress + '/SimulatorControl/?command=getPercentileData';
var urlSingleRunData = 'http://' + ipAddress + '/SimulatorControl/?command=getAllSingleRunData';
var urlBatchRunData = 'http://' + ipAddress + '/SimulatorControl/?command=getAllBatchRunData';
var urlGetAvailableInstance = 'http://' + ipAddress + '/SimulatorControl/?command=getAvailableInstance';
var urlGetProgressInstance = 'http://' + ipAddress + '/SimulatorControl/?command=getProgressInstance';

//Global Variables
var batchRunData;
var singleRunData;
var simChartData = [];
simChartData.push();

//Global Google Chart Variables
//handles the constant updating of google chart
var chart;
var data;
var options;

//START OF GLOBAL FUNCTIONS
/**
 *Takes in a job id and returns the specific id batch results
 *
 *@param {string} id - The batch id of the batch run
 *@return {array} - Only 'batch' param
**/
var getBatchRunDataInfo = function(id) {
    for (var i = 0; i < batchRunData.length; i++) {
        if (batchRunData[i]['batchId'] == id) {
            return batchRunData[i]['batch'];
        }
    }
    return [];
}

/**
 *Takes in a job id and returns the specific id FULL batch results
 *
 *@param {string} id - The batch id of the batch run
 *@return {array} - The entire batch information
**/
var getBatchData = function(id) {
    for (var i = 0; i < batchRunData.length; i++) {
        if (batchRunData[i]['batchId'] == id) {
            return batchRunData[i];
        }
    }
    return [];
}

/**
 *Takes in a job id and returns the specific id FULL batch results
 *
 *@param {string} id - The batch id of the batch run
 *@return {array} - The entire batch information
**/
var searchChartData = function(id){
    for(var i = 0; i < simChartData.length; i++){
        if(simChartData[i]['batchId'] == id){
            console.log('found');
            return true;
        }
    }
}

/**
 *Updates table results and global variable after retrieving data from specific endpoint
 *
**/
var updateTable = function(){
    //Send a ajax request to obtain all batch results
    $.get(urlBatchRunData,function(data){
        $('#table-result').bootstrapTable('load', {
            data:responseHandler(data)
        })
        batchRunData = data;
    })
}

/**
 *Takes in 'batch' parameter and returns the average results
 *
 *@param {array} batch - 'batch' param of a specific batch
 *@return {numbers} - average results of the batch
**/
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

/**
 *Calculates the current progress of the simulation
 *
 *@param {array} batch - 'batch' param of a specific batch
 *@param {number} runs - number of runs
 *@return {numbers} - current progress of the batch
**/
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
    return Math.round((currentProgress / runs) * 100);
};
//END OF GLOBAL FUNCTIONS

//START OF CLICK(S) EVENT HANLDERS
/**
 *Click event handler for switching parameter input options to 'detailed' view
 *
**/
$('#marco').click(function(){
    $('#batchRunParams').show();
    $('#detail').show();
    $('#marco').hide();
    $('#singleRunParams').hide();
})

/**
 *Click event handler for switching parameter input options to 'marco' view
 *
**/
$('#detail').click(function(){
    $('#batchRunParams').hide();
    $('#detail').hide();
    $('#marco').show();
    $('#singleRunParams').show();
})

/**
 *Event handler that clears all simulation results
 *
**/
$('#clearSimulator').click(function(){
    simChartData = [];
    $('#simulationEvacuationChart').html('<h1>No simulations results</h1>');
})

/**
 *Click event handler for submitting simulation configurations selections
 *
**/
$('#simulationSubmit').click(function(){

    //Obtaining simulation parameters input variables
    //Single params
    var building = $('#building select').val();
    var run = $('#run input').val();
    var agents = $('#agents input').val();
    var location = $('#location select').val();
    var time = $('#time input').val();
    var crowd = $('#crowd select').val();
    var lift = $('#lift select').val();
    var escalator = $('#escalator select').val();
    var access = $('#access select').val();
    var information = $('#information select').val();
    var path = $('#path select').val();

    var young = parseInt($("#young input").val());
    var adult = parseInt($("#adult input").val());
    var elder = parseInt($("#elder input").val());

    //Batch params
    var distribution = $('#distribution select').val();
    var disruption = $('#disruption select').val();
    var strategy = $('#strategy select').val();
    
    var ageProfile = {
        "YOUNG":(young/parseInt(agents)).toFixed(2),
        "ADULT":(adult/parseInt(agents)).toFixed(2),
        "ELDER":(elder/parseInt(agents)).toFixed(2)
    }
    console.log(ageProfile);

    //Output final variable
    var output = {};

    //Packing simulation variables inputs in required JSON format
    output['run'] = parseInt(run);
    output['agents'] = parseInt(agents);
    output['building'] = building;
    output['location'] = location;
    output['time'] = time;
    output['crowd'] = crowd;
    output['information'] = information;
    output['path'] = path;
    output['activatedLift'] = [];
    output['activatedEscalator'] = [];
    output['activatedAccess'] = [];
    output['ageProfile'] = ageProfile;


    
    //This handles the processing of DETAILED inputs into desired format
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

    //This handles the processing of MARCO inputs into desired format
    if($('#detail').is(':visible')){
        output['information'] = distribution;
        switch(disruption){
            case 'AllGreen':
                    $('#escalator option').each(function() {
                        output['activatedEscalator'].push($(this).val());
                    });

                    $('#lift option').each(function() {
                        output['activatedLift'].push($(this).val());
                    });

                    $('#access option').each(function() {
                        output['activatedAccess'].push($(this).val());
                    });
                break;
            case 'FullDisruption':
                    output['activatedEscalator'] = [];
                    output['activatedLift'] = [];
                    output['activatedAccess'] = [];
                break;
            case 'DoorWayDisrupted':
                    output['activatedAccess'] = [];
                    $('#escalator option').each(function() {
                        output['activatedEscalator'].push($(this).val());
                    });

                    $('#lift option').each(function() {
                        output['activatedLift'].push($(this).val());
                    });
                break;
            case 'ElevatorsDisrupted':
                    output['activatedLift'] = [];
                    $('#escalator option').each(function() {
                        output['activatedEscalator'].push($(this).val());
                    });

                    $('#access option').each(function() {
                        output['activatedAccess'].push($(this).val());
                    });
                break;
            case 'EscalatorsDisrupted':
                    output['activatedEscalator'] = [];
                    $('#lift option').each(function() {
                        output['activatedLift'].push($(this).val());
                    });

                    $('#access option').each(function() {
                        output['activatedAccess'].push($(this).val());
                    });
                break;
        }

        switch(strategy){
            case 'PI-NB':
                    output['information'] = 'PARTIAL';
                    output['path'] = 'NAIVE';
                break;
            case 'PI-AB':
                    output['information'] = 'PARTIAL';
                    output['path'] = 'ADAPTIVE';
                break;
            case 'CI-NB':
                    output['information'] = 'COMPLETE';
                    output['path'] = 'NAIVE';
                break;
            case 'CI-AB':
                    output['information'] = 'COMPLETE';
                    output['path'] = 'ADAPTIVE';
                break;
            case 'PI-OT':
                    output['information'] = 'PARTIAL';
                    output['path'] = 'ONETIME';
                break;
        }
    }
    

    //Printing of final output variable for debugging purposes
    console.log(JSON.stringify(output));
    //Converting array into JSON string format
    var jsonOutput = JSON.stringify(output);

    //Sending of JSON simulation parameters to the 'start' endpoint
    $.ajax({
        method: 'POST',
        url: urlStart,
        data: { 'config': jsonOutput }
    }).done(function(msg) {
        //Show that this is done
        console.log(msg);
    });

    //Loads table with new data upon submission
    updateTable();
});

var updateTotalAgents = function(){

    var young = parseInt($("#young input").val());
    var adult = parseInt($("#adult input").val());
    var elder = parseInt($("#elder input").val());

    $("#agents input").val(young + adult + elder)
}
//END OF CLICK(S) EVENT HANDLER
$("#young input").change(function(){
    updateTotalAgents();
});

$("#adult input").change(function(){
    updateTotalAgents();
});

$("#elder input").change(function(){
    updateTotalAgents();
});


//The below are preloaded syncronous data before document ready to allow countup plugin to work
$.ajax({
  method: 'GET',
  url: urlBatchRunData,
  async:false
}).done(function( data ) {
    $('#widgetResults').attr('data-value',data.length);
});

$.ajax({
  method: 'GET',
  url: urlGetProgressInstance,
  async:false
}).done(function( data ) {
    console.log(data);
    $('#widgetProgress').attr('data-value',data.length);
});

$.ajax({
  method: 'GET',
  url: urlGetAvailableInstance,
  async:false
}).done(function( data ) {
    $('#widgetAvailable').attr('data-value',data.length);
});


/**
 *START OF DOCUMENT READY FUNCTION
 *Document ready function handles functions/events to be called only after the page has succesfully been fully loaded
 *
*/
$(document).ready(function() {
    
    //$('#images').viewer('show').viewer('view',1);

    //console.log(viewer);
    //Bootstrap table initalization
    $('#table-result').bootstrapTable();

    ///Loads table with new data upon submission
    updateTable();

    //Set interval to poll updates every 5 seconds
    setInterval(updateTable,5000);

    //Select 2 initalization
    $('.js-example-basic-single').select2();

    //Initial loading of Simulation Chart
    $('#simulation').load('simulationEvacuationChart.html');
    
    //Initial hiding of all marco elements
    $('#batchRunParams').hide();
    $('#detail').hide();

    
    //Handles what to show on results modal on click
    $('#resultsModal').on('show.bs.modal', function(event) {

        google.charts.setOnLoadCallback(drawChart);

        function drawChart() {
            var button = $(event.relatedTarget);
            var batchId = button.data('id');
            var batchArr = getBatchRunDataInfo(batchId);
            console.log(batchArr);
            

            var data = new google.visualization.DataTable();
            data.addColumn('number', 'Percentile');
            data.addColumn('number', batchId);
            var output = [];
            //console.log(result);
            if(batchArr.length > 0){
                var avgResults = averageResult(batchArr);
                console.log(avgResults)
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
            }
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

    //Handles what to show on statusModal on click
    $('#statusModal').on('show.bs.modal', function(event) {
        console.log('status')
        var button = $(event.relatedTarget);
        var batchId = button.data('id');
        var batchArr = getBatchData(batchId);

        var modal = $(this);
        var runs = batchArr['runs'];
        var batch = batchArr['batch'];
        //console.log('test');
        console.log(batchArr);
        modal.find('.modal-body').html('<table id=\'instanceTable\' style=\'table-layout:fixed\' class=\'table table-bordered\'>' +
            '<tr><th>Job ID</th><th>Instance State</th></tr>' + '</table>');

        for (var i = 0; i < runs; i++) {

            if(batch[i]){
                var jobId = batch[i]['jobId'];
                var instanceId = batch[i]['instanceId'];
                var instanceState = batch[i]['instanceState'];
                modal.find('#instanceTable').append('<tr><td>' + (i+1) + '</td><<td>' + instanceState + '</td></tr>')
            }else{
                modal.find('#instanceTable').append('<tr><td>' + (i+1) + '</td><<td>QUEUE</td></tr>')
            }
        }


    });

    //handles what to show on paramModal
    $('#paramModal').on('show.bs.modal', function(event) {
        console.log('status')
        var button = $(event.relatedTarget);
        var batchId = button.data('id');
        var batchArr = getBatchData(batchId);

        var modal = $(this);
        var runs = batchArr['runs'];
        console.log(batchArr);
        var param = JSON.parse(batchArr['batch'][0]['parameter']);
        //console.log('test');
        console.log(batchArr);
        var tableArr = [
            '<div style="padding:5px 5px 5px 5px;"><table class="table-bordered">',
                '<tr>',
                    '<th>Runs</th><td>'+param['run']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Agents</th><td>'+param['agents']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Start Time</th><td>'+param['time']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Crowd</th><td>'+param['crowd']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Information</th><td>'+param['information']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Path</th><td>'+param['path']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Activated Lift</th><td>'+param['activatedLift']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Activated Escalator</th><td>'+param['activatedEscalator']+'</td>',
                '</tr>',
                '<tr>',
                    '<th>Activated Access Point</th><td>'+param['activatedAccess']+'</td>',
                '</tr>',
            '</table></div>'
        ].join('');
        modal.find('.modal-body').html(tableArr);
    });

})
//END OF DOCUMENT READY FUNCTION

//THE FOLLOWING FUNCTIONS BELOW ARE API(s) WHICH BELONG TO BOOTSTRAP TABLE FOR CUSTOMIZATION

/**
 *Formats the "Action" table column
 *
 *@param {string} value - the field value
 *@param {object} row - the row record data
 *@param {string} index - the row index
 *@return {string} - html
**/
function operateFormatter(value, row, index) {

    if(!searchChartData(row['batchId'])){
        return [
            '<a id="imageView" data-id="'+row['batchId']+'" class="like ml10" title="Snapshots">',
                '<i class="fa fa-file-image-o"></i>',
            '</a>',
            '<a data-toggle="modal" data-id="'+row['batchId']+'" data-target="#statusModal" class=" ml10" title="Status">',
                '<i class="fa fa-search"></i>',
            '</a>',
            '<a class="edit ml10 '+row['batchId']+'" href="javascript:void(0)" title="Compare">',
                '<i class="fa fa-plus"></i>',
            '</a>',
            '<a class="remove ml10 '+row['batchId']+'" href="javascript:void(0)" title="Remove" style="display:none">',
                '<i class="fa fa-minus"></i>',
            '</a>'
        ].join('');
    }else{
        return [
            '<a id="imageView" data-id="'+row['batchId']+'" class="like ml10" title="Snapshots">',
                '<i class="fa fa-file-image-o"></i>',
            '</a>',
            '<a data-toggle="modal" data-id="'+row['batchId']+'" data-target="#statusModal" class=" ml10" title="Status">',
                '<i class="fa fa-search"></i>',
            '</a>',
            '<a class="edit ml10 '+row['batchId']+'" href="javascript:void(0)" title="Compare" style="display:none">',
                '<i class="fa fa-plus"></i>',
            '</a>',
            '<a class="remove ml10 '+row['batchId']+'" href="javascript:void(0)" title="Remove">',
                '<i class="fa fa-minus"></i>',
            '</a>'
        ].join('');
    }
}


/**
 *Formats the "Progress" table column
 *
 *@param {string} value - the field value
 *@return {string} - html
**/
function progress(value){
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
}





//
/**
 *Handles the click events within the "Actions" column
 *
 *@param {string} event - the jQuery event
 *@param {string} value - he field value
 *@param {object} row - the row record data
 *@param {number} index - the row index
 *@return {string} - html
**/

window.operateEvents = {
    'click .like': function (e, value, row, index) {
        //alert('You click like icon, row: ' + JSON.stringify(row));
        //console.log($("#images"));
        $('#images').viewer('show');
        console.log(value, row, index);
    },
    'click .edit': function (e, value, row, index) {
        // alert('You click edit icon, row: ' + JSON.stringify(row));
        // console.log(value, row, index);
        
        console.log(row['batchId']);
        var selectedId = row['batchId'];
        
        $(this).hide();
        $('.remove.'+selectedId).show();
        
        for (var i = 0; i < batchRunData.length; i++) {
            if (batchRunData[i]['batchId'] == selectedId) {
                //var avgResults = averageResult(batchRunData[i]['batchId']);
                var final = new Array();
                var batchArr = getBatchRunDataInfo(batchRunData[i]['batchId']);
                //console.log(batchId);
                var avgResults = averageResult(batchArr);
                final['batch'] = batchArr;
                final['results'] = avgResults;
                final['batchId'] = batchRunData[i]['batchId'];
                simChartData.push(final);

                console.log(batchArr);
            }
        }

        console.log(simChartData);

        drawChart();
       
    },
    'click .remove':function(e, value, row, index){
        console.log(row['batchId']);
        var selectedId = row['batchId'];

        $(this).hide();
        $('.edit.'+selectedId).show();

        for(var i = 0; i < simChartData.length; i++){
            if(simChartData[i]['batchId'] == selectedId){
                console.log('remove');
                simChartData.splice(i,1);
                break;
            }
        }

        if(simChartData.length > 0){
            drawChart();
        }else{
            $('#simulationEvacuationChart').html('<h1>No simulations results</h1>');
        }
    }

};

/**
 *Before load remote data, handle the response data format
 *
 *@param {object} res - the response data
 *@return {object}
 **/
function responseHandler(res){
    console.log(res);
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
//END OF BOOTSTRAP TABLE FUNCTIONS

/**
 *Draw method for google chart
 *
**/
function drawChart() {
    data = new google.visualization.DataTable();
    data.addColumn('number', 'Percentile');
    console.log(simChartData);
    for (var i = 0; i < simChartData.length; i++) {
        data.addColumn('number', 'ID ' + simChartData[i]['batchId']);
        data.addColumn({'type':'string','role':'tooltip','p':{'html':true}});
    }
    //data.addColumn({'type':'string','role':'tooltip','p':{'html':true}});

    //obtain all results
    var output = [];
    //obtains the length of the total results length
    for (var i = 0; i < simChartData[0]['results'].length; i++) {
        var arr = [];
        var tooltip = [];
        var percentile = (i + 1) * 5;
        arr.push(percentile);
        //
        for (var j = 0; j < simChartData.length; j++) {
            arr.push(simChartData[j]['results'][i]);
            arr.push(createCustomHTMLContent(simChartData[j],simChartData[j]['results'][i],percentile));
        }
        //arr.push(createCustomHTMLContent(simChartData[i]));
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
        },
        //tooltip: {isHtml: true}
        tooltip: {
            isHtml:true,
            trigger:'both'
        }
    };

    chart = new google.visualization.LineChart(document.getElementById('simulationEvacuationChart'));
    // chart.setAction({
    //     id:'parameter',
    //     text:'Show Parameters',
    //     action: function(){
    //         console.log(chart.getSelection());
    //     }
    // });
    chart.draw(data, options);
}
function createCustomHTMLContent(batch,value,percentile){
    console.log(batch);
    console.log("hi");
    var param = JSON.parse(batch['batch'][0]['parameter']);
    return [
    '<div style="padding:5px 5px 5px 5px;"><table class="table-bordered">',
        '<tr>',
            '<th>Evacuation Time</th><td>'+value+'</td>',
        '</tr>',
        '<tr>',
            '<th>Percentile</th><td>'+percentile+'</td>',
        '</tr>',
    '</table>',
    '<div>',
        '<a data-toggle="modal" data-id="'+batch['batch'][0]['batchId']+'" data-target="#paramModal" title="Parameter">',
            'Parameter Values',
        '</a>',
    '</div>',
    '</div>'
    ].join('');
}
// function createCustomHTMLContent(batch,value,percentile){
//     console.log(batch);
//     console.log("hi");
//     var param = JSON.parse(batch['batch'][0]['parameter']);
//     return [
//     '<div style="padding:5px 5px 5px 5px;"><table class="table-bordered">',
//         '<tr>',
//             '<th>Evacuation Time</th><td>'+value+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Percentile</th><td>'+percentile+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Runs</th><td>'+param['run']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Agents</th><td>'+param['agents']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Start Time</th><td>'+param['time']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Crowd</th><td>'+param['crowd']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Information</th><td>'+param['information']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Path</th><td>'+param['path']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Activated Lift</th><td>'+param['activatedLift']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Activated Escalator</th><td>'+param['activatedEscalator']+'</td>',
//         '</tr>',
//         '<tr>',
//             '<th>Activated Access Point</th><td>'+param['activatedAccess']+'</td>',
//         '</tr>',
//     '</table></div>'
//     ].join('');
// }
