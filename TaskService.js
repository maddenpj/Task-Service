var daemon = require('daemon');

var Task = require('./Task.js').Task;
var TaskManager = require('./Task.js').TaskManager;
var Job = require('./Task.js').Job; 
var Control = require('./Control.js').Control;

var jobs = [];
var id = 0;

var taskManager = new TaskManager();
taskManager.loadConfig('./Config-Test.js');

var controlPort = new Control();
controlPort.start(6666);

function main() {
	taskManager.scheduleJobs();
	taskManager.runJobs();
}

daemon.start();
setInterval(main, 1000);


/*********************************************************
	Control Port Handlers 
*********************************************************/

controlPort.register('tasks' , function (taskName) {
	if(taskName === undefined) {
		return taskManager.toString();
	}
	else {
		if(taskManager.queue[taskName] === undefined) return 'Task does not exist!';
		else return taskManager.queue[taskName].toString();
	}
});
controlPort.register('jobs', function (jobName) {
	if(jobName === undefined) {
		/*var out = '------ Jobs List ------\n';
		for(var i = 0; i < jobs.length; i++) {
			out+= i+': '+ jobs[i].scheduledTime + ' ' + jobs[i].task + ' ' + jobs[i].state+'\n';
		}
		return out;*/
		return taskManager.jobsString();
	}
	else {
		if(jobs[jobName] === undefined) return 'Job does not exist!'; 
		return jobs[jobName].toString(jobName);
	}
});
controlPort.register('menu', function () {
	var menuString = '-------- Task Service --------\n\n';
		menuString+= 'tasks <Task Name>\n    - Displays the list of tasks or task details if Task Name is given\n\n';
		menuString+= 'jobs  <Job ID>\n    - Displays the list of jobs or job details if Job ID is given\n';
	return menuString;
});
controlPort.register('date', function () {

	var d = new Date();
	return d.toLocaleString()+'\n'; 
});

/*
function main() {	
	
	for(var i in taskManager.queue) {
		if(!taskManager.queue[i].active) {
			var jj = taskManager.queue[i].spawnJob();
			taskManager.queue[i].active = true;
			taskManager.queue[i].activeJob = jj;
			jobs.push(jj);
		}
	}
	var now = new Date();
	//console.log('Now: ' + now);
	for(var i = 0; i < jobs.length; i++) {
	//	console.log(i+': '+ jobs[i].scheduledTime + ' ' + jobs[i].task + ' ' + jobs[i].state);
		if( jobs[i].scheduledTime === undefined || jobs[i].scheduledTime === null) continue;
		
		if( jobs[i].scheduledTime.getTime() - now.getTime() <= 0 && jobs[i].state === 'Queued' ) {	
		
			if(taskManager.queue[jobs[i].task].depends === undefined) {		
				jobs[i].state = 'Running';
				jobs[i].run();
				taskManager.queue[jobs[i].task].active = false;
				taskManager.queue[jobs[i].task].oldRunTime.setTime( jobs[i].scheduledTime.getTime() );
			}
			else {
				console.log(jobs[i]);

				for(var j = 0; j < jobs.length; j++) {
					if(jobs[j].task === jobs[i].depends) {
						if(jobs[j].state === 'Success') {
							jobs[i].state = 'Running';
							jobs[i].run();
							taskManager.queue[jobs[i].task].active = false;
//							taskManager.queue[jobs[i].task].oldRunTime.setTime( jobs[i].scheduledTime.getTime() );
						}
						else {
							jobs[i].state = 'Waiting';
						}
					}
				}
			}

		}
		/*
		if(jobs[i].rc === 0 && jobs[i].state === 'Running') {
			jobs[i].state = 'Ran';
		}
	}
	
	

	//console.log('\n');
}
*/
