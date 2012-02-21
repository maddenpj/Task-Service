var CONTROL_PORT = 6666;

var daemon = require('daemon');
var TaskManager = require('../bin/Task.js').TaskManager;
var Control = require('control-port').ControlPort;


if(process.argv[2] === undefined ) {
	console.log('node TaskService.js <Task Config> <Alerts Config>');
	process.exit(0);
}
//daemon.start();

var APPROOT = '/home/patrick/src/NodeTask/';
var APPROOT = '/home/prod/bin/NodeTask';

process.chdir(APPROOT+'log/');
//process.chdir('/home/patrick/src/NxtNode/apps/taskservice/log/');

daemon.daemonize('TaskService.log','TaskService.lock', function (err, pid) { 
	console.log(err);
	console.log('PID: ' + pid);
});



var taskManager = new TaskManager();


var taskConfigFilePath = APPROOT + process.argv[2];
//var configFilePath = '/home/patrick/src/NxtNode/apps/taskservice/' + process.argv[2];
taskManager.loadConfig(taskConfigFilePath);
//taskManager.loadConfig('./'+process.argv[2]);

//var alertConfigFilePath = '/home/prod/process/taskService/' + process.argv[3];
//var alertConfigFilePath = '/home/patrick/src/NxtNode/apps/taskservice/' + process.argv[3];
//alertManager.loadConfig(alertConfigFilePath);

var controlPort = new Control('TaskService');
console.log('Control Port on '+CONTROL_PORT);

controlPort.start(CONTROL_PORT);

process.on('uncaughtException', function(err) {
	console.log(err);
	console.log(err.stack);
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
controlPort.register('depends', function (taskName) {
	if(taskManager.queue[taskName] === undefined) return 'Task does not exist';
	else return (''+taskManager.queue[taskName].depends);

});
controlPort.register('jobs', function () {
		return taskManager.jobsString();
});
controlPort.register('menu', function () {
	var menuString = '-------- Task Service --------\n\n';
		menuString+= 'tasks <Task Name>\n    - Displays the list of tasks or task details if Task Name is given\n\n';
		menuString+= 'group <Group>\n    - Filters the list of task by group\n';
		menuString+= 'dept  <Department>\n    - Filters the list of tasks by department\n';
		menuString+= 'filter <Group> <Deptartment>\n    - Filters the list of tasks by group and department\n';
		menuString+= 'jobs\n    - Displays lists of scheduled jobs and current jobs\n';
		menuString+= 'depends <Task Name>\n    - Displays dependencies for a task\n\n';
		menuString+= '\tTask Options\n'
		menuString+= 'enable <Task Name>\n    - Enables a job for scheduling\n';
		menuString+= 'disable <Task Name>\n    - Disables a job for scheduling\n\n';
		menuString+= '\tJob Options\n'
		menuString+= 'rerun <Task Name>\n    - Reruns the task\'s current job\n';
		menuString+= 'retry <Task Name>\n    - Restarts Waiting jobs\n';
		menuString+= 'set <State> <Task Name>\n    - Set the task\'s state\n';
		menuString+= 'cancel <Task Name>\n    - Cancels the task\'s scheduled job\n';
		menuString+= 'cancelD <Task Name>\n    - Cancels and disables the task \n\n';
		menuString+= '\tConfiguration Options\n'
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
    return taskManager.reloadConfig(taskConfigFilePath);
});
controlPort.register('load-config', function (filename) {
    taskConfigFilePath = filename;
	return taskManager.reloadConfig(filename);

});

controlPort.register('date', function () {

	var d = new Date();
	return d.toLocaleString()+'\n'; 
});
controlPort.register('group', function (group) {
    return taskManager.filter({group: group});
});
controlPort.register('dept', function (dept) {
    return taskManager.filter({dept: dept});
});
controlPort.register('filter', function (group,dept) {
    return taskManager.filter({group: group, dept:dept});
});

//TODO: Merge into NxtNode::Core::Logging
function getLogName() {
	var procElems = process.argv[1].split('/');
	var appName = procElems.pop();
	var logNameE = appName.split('.');
//	return 'Log.'+logNameE[0]+'.'+Core.Time.getCurrentDate().toString() + '.'+ Core.Time.getCurrentTime().toString();

}
