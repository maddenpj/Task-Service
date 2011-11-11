var CONTROL_PORT = 6666;

var daemon = require('daemon');

if(process.argv[2] === undefined ) {
	console.log('node TaskService.js <config>');
	process.exit(0);
}
//daemon.start();

process.chdir('/home/prod/process/taskService/log/');
//process.chdir('/home/patrick/src/NxtNode/apps/taskservice/log/');

daemon.daemonize('out','out.lock', function (err, pid) { 
	console.log(err);
	console.log(pid);
});

var Task = require('../bin/Task.js').Task;
var TaskManager = require('../bin/Task.js').TaskManager;
var Job = require('../bin/Task.js').Job; 
var Control = require('../bin/Control.js').Control;

var jobs = [];
var id = 0;

var taskManager = new TaskManager();


var configFilePath = '/home/prod/process/taskService/' + process.argv[2];
//var configFilePath = '/home/patrick/src/NxtNode/apps/taskservice/' + process.argv[2];
taskManager.loadConfig(configFilePath);
//taskManager.loadConfig('./'+process.argv[2]);

var controlPort = new Control();
Core.log('Control Port on '+CONTROL_PORT);

controlPort.start(CONTROL_PORT);

process.on('uncaughtException', function(err) {
	Core.log(err);
});

function main() {
	taskManager.scheduleJobs();
	taskManager.runJobs();
}


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
		menuString+= 'jobs\n    - Displays lists of scheduled jobs and current jobs\n';
		menuString+= 'enable <Task Name>\n    - Enables a job for scheduling\n';
		menuString+= 'disable <Task Name>\n    - Disables a job for scheduling\n';
		menuString+= 'rerun <Task Name>\n    - Reruns the task\'s current job\n';
		menuString+= 'retry <Task Name>\n    - Restarts Waiting jobs\n';
		menuString+= 'set <State> <Task Name>\n    - Set the task\'s state\n';
		menuString+= 'cancel <Task Name>\n    - Cancels the task\'s scheduled job\n';
		menuString+= 'cancelD <Task Name>\n    - Cancels and disables the task \n';
		menuString+= 'reload-config\n    - reloads the Config file \n';
		menuString+= 'load-config <Config File>\n    - Loads a new Config \n';
		menuString+= 'date\n    - Current Date/Time\n';
		menuString+= 'shutdown\n    - Shutsdown the Task Service\n';
		
	return menuString;
});

controlPort.register('enable', function (task) {
	return taskManager.enable(task)+'\n';
});
controlPort.register('disable', function (task) {
	return taskManager.disable(task)+'\n';
});
controlPort.register('rerun',function (task) {
	return taskManager.rerun(task) + '\n';
});
controlPort.register('retry',function (task) {
	return taskManager.retry(task) + '\n';
});
controlPort.register('set', function (state,task) {
	return taskManager.state(task,state)+'\n';
});
controlPort.register('cancel', function (task) {
	return taskManager.cancel(task)+'\n';
});
controlPort.register('cancelD', function (task) {
	return (taskManager.cancel(task) + '\n' + taskManager.disable(task));
});
controlPort.register('shutdown', function () {
	process.exit(0);
});
controlPort.register('reload-config', function () {
    return taskManager.reloadConfig(configFilePath);
});
controlPort.register('load-config', function (filename) {
    return taskManager.reloadConfig(filename);
});

controlPort.register('date', function () {

	var d = new Date();
	return d.toLocaleString()+'\n'; 
});

