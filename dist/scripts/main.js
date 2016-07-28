"use strict";function operateFormatter(t,a,e){return searchChartData(a.batchId)?['<a id="imageView" data-id="'+a.batchId+'" class="like ml10" title="Snapshots">','<i class="fa fa-file-image-o"></i>',"</a>",'<a data-toggle="modal" data-id="'+a.batchId+'" data-target="#statusModal" class=" ml10" title="Status">','<i class="fa fa-search"></i>',"</a>",'<a class="edit ml10 '+a.batchId+'" href="javascript:void(0)" title="Compare" style="display:none">','<i class="fa fa-plus"></i>',"</a>",'<a class="remove ml10 '+a.batchId+'" href="javascript:void(0)" title="Remove">','<i class="fa fa-minus"></i>',"</a>"].join(""):['<a id="imageView" data-id="'+a.batchId+'" class="like ml10" title="Snapshots">','<i class="fa fa-file-image-o"></i>',"</a>",'<a data-toggle="modal" data-id="'+a.batchId+'" data-target="#statusModal" class=" ml10" title="Status">','<i class="fa fa-search"></i>',"</a>",'<a class="edit ml10 '+a.batchId+'" href="javascript:void(0)" title="Compare">','<i class="fa fa-plus"></i>',"</a>",'<a class="remove ml10 '+a.batchId+'" href="javascript:void(0)" title="Remove" style="display:none">','<i class="fa fa-minus"></i>',"</a>"].join("")}function progress(t){return console.log(t),'<div class="dashboard-stat2" style="background:none;padding:0;"><div class="progress-info"><div class="progress"><span style="width: '+t+'%;" class="progress-bar progress-bar-success green-sharp"><span class="sr-only">'+t+'% progress</span></span></div><div class="status"><div class="status-title"> progress </div><div class="status-number">'+t+"% </div></div></div></div>"}function responseHandler(t){console.log(t);for(var a=[],e=0;e<t.length;e++){var s={};s.batchId=t[e].batchId,s.runs=t[e].runs,s.progress=currentProgress(t[e].batch,t[e].runs),a.push(s)}return a}function drawChart(){data=new google.visualization.DataTable,data.addColumn("number","Percentile"),console.log(simChartData);for(var t=0;t<simChartData.length;t++)data.addColumn("number","ID "+simChartData[t].batchId),data.addColumn({type:"string",role:"tooltip",p:{html:!0}});for(var a=[],t=0;t<simChartData[0].results.length;t++){var e=[],s=5*(t+1);e.push(s);for(var i=0;i<simChartData.length;i++)e.push(simChartData[i].results[t]),e.push(createCustomHTMLContent(simChartData[i],simChartData[i].results[t],s));a.push(e)}data.addRows(a),options={title:"Evacuation Time of Crowd",vAxis:{title:"Evacuation Time (sec)"},hAxis:{title:"Percentile"},chartArea:{width:"50%"},tooltip:{isHtml:!0,trigger:"both"}},chart=new google.visualization.LineChart(document.getElementById("simulationEvacuationChart")),chart.draw(data,options)}function createCustomHTMLContent(t,a,e){console.log(t),console.log("hi");JSON.parse(t.batch[0].parameter);return['<div style="padding:5px 5px 5px 5px;"><table class="table-bordered">',"<tr>","<th>Evacuation Time</th><td>"+a+"</td>","</tr>","<tr>","<th>Percentile</th><td>"+e+"</td>","</tr>","</table>","<div>",'<a data-toggle="modal" data-id="'+t.batch[0].batchId+'" data-target="#paramModal" title="Parameter">',"Parameter Values","</a>","</div>","</div>"].join("")}google.charts.load("current",{packages:["line","corechart"]});var ipAddress="10.1.20.70:8080",urlStatus="http://"+ipAddress+"/SimulatorControl/?command=status",urlStart="http://"+ipAddress+"/SimulatorControl/?command=start",urlStop="http://"+ipAddress+"/SimulatorControl/?command=urlStop",urlData="http://"+ipAddress+"/SimulatorControl/?command=getPercentileData",urlSingleRunData="http://"+ipAddress+"/SimulatorControl/?command=getAllSingleRunData",urlBatchRunData="http://"+ipAddress+"/SimulatorControl/?command=getAllBatchRunData",urlGetAvailableInstance="http://"+ipAddress+"/SimulatorControl/?command=getAvailableInstance",urlGetProgressInstance="http://"+ipAddress+"/SimulatorControl/?command=getProgressInstance",batchRunData,singleRunData,simChartData=[];simChartData.push();var chart,data,options,getBatchRunDataInfo=function(t){for(var a=0;a<batchRunData.length;a++)if(batchRunData[a].batchId==t)return batchRunData[a].batch;return[]},getBatchData=function(t){for(var a=0;a<batchRunData.length;a++)if(batchRunData[a].batchId==t)return batchRunData[a];return[]},searchChartData=function(t){for(var a=0;a<simChartData.length;a++)if(simChartData[a].batchId==t)return console.log("found"),!0},updateTable=function(){$.get(urlBatchRunData,function(t){$("#table-result").bootstrapTable("load",{data:responseHandler(t)}),batchRunData=t})},averageResult=function(t){var a=[],e=JSON.parse(t[0].result);if(null!=e)for(var s=0;s<e.results.length;s++){for(var i=0,n=0;n<t.length;n++){var o=JSON.parse(t[n].result);null!=o&&(i+=o.results[s])}a.push(i/t.length)}return a},currentProgress=function t(a,e){var t=0;a.length;if(a.length>0)for(var s=0;s<a.length;s++)"FINISHED"==a[s].instanceState&&(t+=1);return Math.round(t/e*100)};$("#marco").click(function(){$("#batchRunParams").show(),$("#detail").show(),$("#marco").hide(),$("#singleRunParams").hide()}),$("#detail").click(function(){$("#batchRunParams").hide(),$("#detail").hide(),$("#marco").show(),$("#singleRunParams").show()}),$("#clearSimulator").click(function(){simChartData=[],$("#simulationEvacuationChart").html("<h1>No simulations results</h1>")}),$("#simulationSubmit").click(function(){var t=$("#building select").val(),a=$("#run input").val(),e=$("#agents input").val(),s=$("#location select").val(),i=$("#time input").val(),n=$("#crowd select").val(),o=$("#lift select").val(),r=$("#escalator select").val(),l=$("#access select").val(),c=$("#information select").val(),d=$("#path select").val(),h=parseInt($("#young input").val()),u=parseInt($("#adult input").val()),v=parseInt($("#elder input").val()),p=$("#distribution select").val(),m=$("#disruption select").val(),g=$("#strategy select").val(),f={YOUNG:(h/parseInt(e)).toFixed(2),ADULT:(u/parseInt(e)).toFixed(2),ELDER:(v/parseInt(e)).toFixed(2)};console.log(f);var b={};if(b.run=parseInt(a),b.agents=parseInt(e),b.building=t,b.location=s,b.time=i,b.crowd=n,b.information=c,b.path=d,b.activatedLift=[],b.activatedEscalator=[],b.activatedAccess=[],b.ageProfile=f,$("#escalator option").each(function(){console.log($(this).val()),r?-1==r.indexOf($(this).val())&&b.activatedEscalator.push($(this).val()):b.activatedEscalator.push($(this).val())}),$("#lift option").each(function(){o?-1==o.indexOf($(this).val())&&b.activatedLift.push($(this).val()):b.activatedLift.push($(this).val())}),$("#access option").each(function(){l?-1==l.indexOf($(this).val())&&b.activatedAccess.push($(this).val()):b.activatedAccess.push($(this).val())}),$("#detail").is(":visible")){switch(b.information=p,m){case"AllGreen":$("#escalator option").each(function(){b.activatedEscalator.push($(this).val())}),$("#lift option").each(function(){b.activatedLift.push($(this).val())}),$("#access option").each(function(){b.activatedAccess.push($(this).val())});break;case"FullDisruption":b.activatedEscalator=[],b.activatedLift=[],b.activatedAccess=[];break;case"DoorWayDisrupted":b.activatedAccess=[],$("#escalator option").each(function(){b.activatedEscalator.push($(this).val())}),$("#lift option").each(function(){b.activatedLift.push($(this).val())});break;case"ElevatorsDisrupted":b.activatedLift=[],$("#escalator option").each(function(){b.activatedEscalator.push($(this).val())}),$("#access option").each(function(){b.activatedAccess.push($(this).val())});break;case"EscalatorsDisrupted":b.activatedEscalator=[],$("#lift option").each(function(){b.activatedLift.push($(this).val())}),$("#access option").each(function(){b.activatedAccess.push($(this).val())})}switch(g){case"PI-NB":b.information="PARTIAL",b.path="NAIVE";break;case"PI-AB":b.information="PARTIAL",b.path="ADAPTIVE";break;case"CI-NB":b.information="COMPLETE",b.path="NAIVE";break;case"CI-AB":b.information="COMPLETE",b.path="ADAPTIVE";break;case"PI-OT":b.information="PARTIAL",b.path="ONETIME"}}console.log(JSON.stringify(b));var I=JSON.stringify(b);$.ajax({method:"POST",url:urlStart,data:{config:I}}).done(function(t){console.log(t)}),updateTable()});var updateTotalAgents=function(){var t=parseInt($("#young input").val()),a=parseInt($("#adult input").val()),e=parseInt($("#elder input").val());$("#agents input").val(t+a+e)};$("#young input").change(function(){updateTotalAgents()}),$("#adult input").change(function(){updateTotalAgents()}),$("#elder input").change(function(){updateTotalAgents()}),$.ajax({method:"GET",url:urlBatchRunData,async:!1}).done(function(t){$("#widgetResults").attr("data-value",t.length)}),$.ajax({method:"GET",url:urlGetProgressInstance,async:!1}).done(function(t){console.log(t),$("#widgetProgress").attr("data-value",t.length)}),$.ajax({method:"GET",url:urlGetAvailableInstance,async:!1}).done(function(t){$("#widgetAvailable").attr("data-value",t.length)}),$(document).ready(function(){$("#table-result").bootstrapTable(),updateTable(),setInterval(updateTable,5e3),$(".js-example-basic-single").select2(),$("#simulation").load("simulationEvacuationChart.html"),$("#batchRunParams").hide(),$("#detail").hide(),$("#resultsModal").on("show.bs.modal",function(t){function a(){var a=$(t.relatedTarget),e=a.data("id"),s=getBatchRunDataInfo(e);console.log(s);var i=new google.visualization.DataTable;i.addColumn("number","Percentile"),i.addColumn("number",e);var n=[];if(s.length>0){var o=averageResult(s);console.log(o);for(var r=0;r<o.length;r++){var l=[];l.push(5*(r+1)),l.push(o[r]),n.push(l)}i.addRows(n)}var c={title:"Evacuation Time of Crowd",width:"100%",height:"400",legend:"none",vAxis:{title:"Evacuation Time (sec)"},hAxis:{title:"Percentile"},chartArea:{left:"25%"}},d=new google.visualization.LineChart(document.getElementById("resultsModalChart"));d.draw(i,c)}google.charts.setOnLoadCallback(a)}),$("#statusModal").on("show.bs.modal",function(t){console.log("status");var a=$(t.relatedTarget),e=a.data("id"),s=getBatchData(e),i=$(this),n=s.runs,o=s.batch;console.log(s),i.find(".modal-body").html("<table id='instanceTable' style='table-layout:fixed' class='table table-bordered'><tr><th>Job ID</th><th>Instance State</th></tr></table>");for(var r=0;n>r;r++)if(o[r]){var l=(o[r].jobId,o[r].instanceId,o[r].instanceState);i.find("#instanceTable").append("<tr><td>"+(r+1)+"</td><<td>"+l+"</td></tr>")}else i.find("#instanceTable").append("<tr><td>"+(r+1)+"</td><<td>QUEUE</td></tr>")}),$("#paramModal").on("show.bs.modal",function(t){console.log("status");var a=$(t.relatedTarget),e=a.data("id"),s=getBatchData(e),i=$(this);s.runs;console.log(s);var n=JSON.parse(s.batch[0].parameter);console.log(s);var o=['<div style="padding:5px 5px 5px 5px;"><table class="table-bordered">',"<tr>","<th>Runs</th><td>"+n.run+"</td>","</tr>","<tr>","<th>Agents</th><td>"+n.agents+"</td>","</tr>","<tr>","<th>Start Time</th><td>"+n.time+"</td>","</tr>","<tr>","<th>Crowd</th><td>"+n.crowd+"</td>","</tr>","<tr>","<th>Information</th><td>"+n.information+"</td>","</tr>","<tr>","<th>Path</th><td>"+n.path+"</td>","</tr>","<tr>","<th>Activated Lift</th><td>"+n.activatedLift+"</td>","</tr>","<tr>","<th>Activated Escalator</th><td>"+n.activatedEscalator+"</td>","</tr>","<tr>","<th>Activated Access Point</th><td>"+n.activatedAccess+"</td>","</tr>","</table></div>"].join("");i.find(".modal-body").html(o)})}),window.operateEvents={"click .like":function(t,a,e,s){$("#images").viewer("show"),console.log(a,e,s)},"click .edit":function(t,a,e,s){console.log(e.batchId);var i=e.batchId;$(this).hide(),$(".remove."+i).show();for(var n=0;n<batchRunData.length;n++)if(batchRunData[n].batchId==i){var o=new Array,r=getBatchRunDataInfo(batchRunData[n].batchId),l=averageResult(r);o.batch=r,o.results=l,o.batchId=batchRunData[n].batchId,simChartData.push(o),console.log(r)}console.log(simChartData),drawChart()},"click .remove":function(t,a,e,s){console.log(e.batchId);var i=e.batchId;$(this).hide(),$(".edit."+i).show();for(var n=0;n<simChartData.length;n++)if(simChartData[n].batchId==i){console.log("remove"),simChartData.splice(n,1);break}simChartData.length>0?drawChart():$("#simulationEvacuationChart").html("<h1>No simulations results</h1>")}};