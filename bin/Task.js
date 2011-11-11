var cp = require('child_process');

var Scheduler = require('../bin/Scheduler.js').Scheduler;

require('/home/prod/bin/node/core/Core.js');
//require('../../src/core/Alerts.js');
require('/home/prod/bin/node/core/Logging.js');


function Job() {
	this.command = '';
	this.machine = '';
	this.user = '';

	this.scheduledTime = null;
	this.startRunTime = null;
	this.endRunTime = null;
	
	this.stdout = '';
	this.stderr = '';
	this.rc = null;
	
	this.task = '';
	this.state = 'SCHD'; // Valid States: FAIL, DONE, LIVE, WAIT, SCHD 
}

function Task(name,config) { 
	this.name = name;
	for(var i in config) {
		this[i] = config[i]
	}
	this.enabled = true;
	
	this.activeJob = null;
	this.scheduledJob = null;

	if(config.runAs === undefined) this.user = defaultUser;
	else this.user = config.runAs;
}

Job.prototype.run = function () {
	var self = this;
	self.startRunTime = new Date();

	Core.log('Running ssh '+this.user+'@' +this.machine  +' "'+ this.command+'"');
	console.log('Running ssh '+this.user+'@' +this.machine  +' "'+ this.command+'"');
	
	cp.exec('ssh '+this.user+'@' +this.machine  +' "'+ this.command+'"', function (error, stdout, stderr) {
		if(error === null) {
			self.rc = 0; 
			self.state = 'DONE';
			Core.log('Job: '+self.task + '@' + self.scheduledTime.toLocaleString()+ ' Succeed!');
		}
		else { 
			self.rc = error.code;
			self.state = 'FAIL';
			Core.log('Job: '+self.task + '@' + self.scheduledTime.toLocaleString() +' Failed!');
		}
		self.stdout = stdout;
		self.stderr = stderr;
		self.endRunTime = new Date();
	});

}

Task.prototype.spawnJob = function() {
	var job = new Job();
	job.command = this.command; 
	job.task = this.name;
	job.machine = this.node;
	job.scheduledTime = Scheduler.parse(this.schedule);
	job.user = this.user;
	return job;
}

Task.prototype.scheduleJob = function () {
	if(this.enabled) {
		if(this.scheduledJob === null) {
			if(this.activeJob !== null) {
				if(this.activeJob.state === 'DONE' || (this.activeJob.state !== 'DONE' && this.failPolicy === 'enable')) {
					this.scheduledJob = this.spawnJob();
				}
				if(this.activeJob.state !== 'DONE' && this.failPolicy === 'disable') {
					this.enabled = false;
				}
			}
			else {
				this.scheduledJob = this.spawnJob();
			}
		}
	}
}

Task.prototype.runJob = function () {
	this.scheduledJob.state = 'LIVE';
	this.activeJob = this.scheduledJob.clone();
	this.scheduledJob = null;
	this.activeJob.run();
}



function TaskManager() {
	this.queue = {};
	this.config = null;
	this.jobs = [];
}

TaskManager.prototype.scheduleJobs = function() {
	for(var i in this.queue) {
		var task = this.queue[i];
		task.scheduleJob();
	}
}

TaskManager.prototype.runJobs = function () {
	var now = new Date();
	for(var i in this.queue) {
		var task = this.queue[i];
		var job = task.scheduledJob;
		if(job === undefined || job === null ||  job.scheduledTime === null || job.scheduledTime === undefined ) continue;
		
		if( job.scheduledTime.getTime() - now.getTime() <= 0 && job.state === 'SCHD') {
			if(task.depends === undefined) {
				task.runJob();	
			}
			else {
				var run = true;
				for (var j in task.depends) {
					if(this.queue[task.depends[j]] === undefined) {
						Core.log('Invalid Dependency ' + task.depends[j] + ' for ' + task.name);
						run = false;
						continue;
					}
					if(this.queue[task.depends[j]].activeJob === null) {
						//run = false;
						continue;
					}
					else {
						run = run && (this.queue[task.depends[j]].activeJob.state === 'DONE');
					}
				}
				if(run) {
					task.runJob();
				}
				else {
					Core.log('Dependencies not met for ' + task.name + ' Now Waiting');
					job.state = 'WAIT';
				}
			}
		}
	}
}

TaskManager.prototype.enable = function (task) {
	if(this.queue[task] === undefined) return 'Task not found!';
	this.queue[task].enabled = true; return ''+task+' Enabled'
}

TaskManager.prototype.disable = function (task) {
	if(this.queue[task] === undefined) return 'Task not found!';
	this.queue[task].enabled = false; return ''+task+' Disabled';
}

TaskManager.prototype.rerun = function (taskName) {
	if(this.queue[taskName] === undefined) return 'Task not found!';
	var task = this.queue[taskName];

	if(task.activeJob === null) return 'No current job for '+taskName+'!';
	if(task.activeJob.state === 'DONE' || task.activeJob.state === 'FAIL') {
		task.activeJob.state = 'LIVE';
		task.activeJob.run();
		return 'Rerunning Job';
	}

	return 'Job is already running!';
}

TaskManager.prototype.retry = function (taskName) {
	if(this.queue[taskName] === undefined) return 'Task not found!';
	var task = this.queue[taskName];
	
	if(task.scheduledJob === null) return 'No scheduled job for '+taskName+'!';
	if(task.scheduledJob.state !== 'WAIT') return 'Job is not waiting!';
	
	task.runJob();
	return 'Restarting Job';
}

TaskManager.prototype.cancel = function (task) {
	if(this.queue[task] === undefined) return 'Task not found!';
	this.queue[task].scheduledJob = null;
	return 'Next Scheduled Job canceled';
}

TaskManager.prototype.state = function (task,state) {
	if(this.queue[task] === undefined) return 'Task not found!';
	var task = this.queue[task];
	
	switch (state) {
		/*case 'Running':
			if(task.activeJob === null) return 'No active job for this task!';
			task.activeJob.state = 'Running'; break;
		*/
		case 'wait':
		case 'WAIT':
			if(task.scheduledJob === null) return 'No scheduled job for this task!';
			task.scheduledJob.state = 'WAIT'; break;
		
		case 'done':
		case 'DONE':
			if(task.activeJob === null) return 'No active job for this task!';
			task.activeJob.state = 'DONE'; break;
		
		case 'fail':
		case 'FAIL':
			if(task.activeJob === null) return 'No active job for this task!';
			task.activeJob.state = 'FAIL'; break;
		
		case 'schd':
		case 'SCHD':
			if(task.scheduledJob === null) return 'No scheduled job for this task!';
			task.scheduledJob.state = 'SCHD'; break;

		default: 
			return 'Not a valid state!';
	}
	return 'State changed';
}

//Global Variable... whatever
var defaultUser;

TaskManager.prototype.loadConfig = function (filename) {
	if(this.config === null) {
		this.config = require(filename).Config;
		defaultUser = this.config.defaultUser;
		for( var i in this.config.Tasks) {
			this.queue[i] = new Task(i,this.config.Tasks[i]);
		}
	}
}

TaskManager.prototype.reloadConfig = function (filename) {
	console.log('Reading Config: ' + filename);
	
	if(require.cache[filename]) {
		delete require.cache[filename];
	}
	var nConfig;
	try {
		nConfig = require(filename).Config;
		defaultUser = nConfig.defaultUser;
	}
	catch (err) {
		return (err);
	}
	
	for(var i in nConfig.Tasks) {
		if(this.queue[i] === undefined) {
			this.queue[i] = new Task(i,nConfig.Tasks[i]); 
		}
		else {
			var activeJob = this.queue[i].activeJob;
			this.queue[i] = new Task(i, nConfig.Tasks[i]);
			this.queue[i].activeJob = activeJob; 
		}
		
	}
	for(var i in this.queue) {
		if(nConfig.Tasks[i] === undefined) {
			delete this.queue[i];
		}
	}
	this.config = nConfig;
	return "Config: "+filename+" Loaded Successfuly";
}



TaskManager.prototype.saveState = function () {
    console.log (this);

}

TaskManager.prototype.toString = function () {
	var out = '------ Task List ------\n\n';
	var max = 0;
	for(var i in this.queue) {
		if( i.length > max) max = i.length;
	}
	for(var i in this.queue) {

		var dS = (max - i.length) + 1;
		out+= ' - '+i+' ';
		for(var j = 0; j<dS;j++) out+=' ';
		(this.queue[i].enabled) ? out+= green('Enabled') : out+= red('Disabled');
		out+= '\n';
	}
	return out;
}

TaskManager.prototype.jobsString = function () {
	var	out = '\n---- Scheduled ----\n';
	var list = [];
	var max = 0;
	for(var i in this.queue) {
		var task = this.queue[i];
		if(task.scheduledJob !== null) {
			list.push( {
				name : i,
				time : task.scheduledJob.scheduledTime,
				state : task.scheduledJob.state,
			});
			if(i.length > max)
				max = i.length;
		}
	}
	list.sort(function (a,b) {
		return a.time.getTime() - b.time.getTime();
	});
	
	for(var i = 0; i<list.length; i++) {
		var dS = (max - list[i].name.length) + 1;
		out+=list[i].name +':';
		for(var j = 0; j<dS;j++) out+=' ';
		out+=list[i].time+ ' ' + colorState(list[i].state)+'\n';
	}

	out += '\n---- Current ----\n';
	list = [];
	for(var i in this.queue) {
		var task = this.queue[i];
		if(task.activeJob !== null) {	
			list.push ({
				name :  i,
				time : task.activeJob.startRunTime,
				state : task.activeJob.state
			});
		}
	}
	list.sort(function (a,b) {
		return b.time.getTime() - a.time.getTime();
	});
	for(var i = 0; i < list.length; i++) {
		var dS = (max - i.length) + 1;
		out+= list[i].name +':';
		for(var j = 0; j<dS;j++) out+=' ';
		out+=list[i].time + ' ' + colorState(list[i].state)+'\n';	
	}
	return out;
}

Job.prototype.clone = function () {
	var cl = new Job();
	cl.command = this.command;
	cl.scheduledTime = new Date(this.scheduledTime.getTime());
	//cl.startRunTime = new Date(this.startRunTime.getTime());
	//cl.endRunTime = new Date(this.endRunTime.getTime());
	
	cl.stdout = this.stdout;
	cl.stderr = this.stderr;
	cl.rc = this.rc;
	
	cl.machine = this.machine;
	cl.user = this.user

	cl.task = this.task;
	cl.state = this.state;
	return cl;
}


Job.prototype.toString = function (i) {
	var out = '';
	//out+='---- '+this.task+'.'+i+' ----\n';
	
	out+='State:           ' + colorState(this.state)+'\n';
	out+='Scheduled Time:  ' + this.scheduledTime+'\n';
		
	if(this.startRunTime !== null) {
		out+='Start Time:      '+ this.startRunTime +'\n';
	}
	if(this.startRunTime !== null && this.endRunTime!== null) {
		var duration = this.endRunTime.getTime() - this.startRunTime.getTime();
		duration /= 1000;
		out+='Duration:        '+ duration.toFixed(4)+'s\n';
	}
	if(this.rc !== null)
		out+='Return Code:     ' + this.rc+'\n\n'; 

	if(this.stderr !== '') 
		out+='stderr:          ' + this.stderr+'\n';
	
	if(this.stdout !== '')
		out+='stdout:          ' + this.stdout+'\n';
	

	return out;
}

Task.prototype.toString = function () {
	var out = '';
	out+='---- '+this.name+' ----\n';
	out+='command:      ' + this.command+'\n';
	out+='schedule:     ' + this.schedule+ '\n';
	out+='node:         ' + this.node+ '\n';
	out+='fail policy:  ' + this.failPolicy+ '\n';
	out+='enabled:      ' + this.enabled+ '\n';
	if(this.depends !== undefined)
		out+='depends:      ' + this.depends+'\n';

	if(this.activeJob !== null) {
		out+='\n-- Current Job --\n';
		out+=this.activeJob.toString()+'\n';
	}
	if(this.scheduledJob !== null) {
		out+='\n-- Scheduled Job --\n';
		out+=this.scheduledJob.toString()+'\n\n';
	}

	return out;
}


function colorState(state) {
	switch(state) {
		case 'LIVE': return cyan(state); break;
		case 'DONE': return green(state); break;
		case 'FAIL': return red(state); break;
		case 'SCHD': return blue(state); break;
		case 'WAIT': return yellow(state); break;
		default: return state;
	}
}

function blue(str) {
	return '\033[34m' + str + '\033[39m';
}
function red(str) {
	return '\033[31m' + str + '\033[39m';
}
function green(str) {
	return '\033[32m' + str +'\033[39m';
}
function yellow(str) {
	return '\033[33m' + str +'\033[39m';
}
function cyan(str) {
	return '\033[36m' + str +'\033[39m';
}


exports.Task = Task;
exports.TaskManager = TaskManager;
exports.Job = Job;

/*
var tm = new TaskManager();
tm.loadConfig('./Config-Test.js');
console.log(tm.toString());
console.log(tm.queue['uname'].toString());
*/
