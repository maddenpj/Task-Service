var cp = require('child_process');

var Scheduler = require('./Scheduler.js').Scheduler;

function Job() {
	this.command = '';
	
	this.scheduledTime = null;
	this.startRunTime = null;
	this.endRunTime = null;
	
	this.stdout = '';
	this.stderr = '';
	this.rc = null;
	
	this.task = '';
	this.state = 'Queued'; // Valid States: Queued, Running, Sucess, Failure, Waiting
}

Job.prototype.toString = function (i) {
	var out = '';
	//out+='---- '+this.task+'.'+i+' ----\n';
	out+='State:           ' + this.state+'\n';
	out+='Scheduled Time:  ' + this.scheduledTime+'\n';
	
	if(this.startRunTime !== null) 
		out+='Start Time:      ' + this.startRunTime+'\n';
	
	if(this.endRunTime !== null)
		out+='End Time:        ' + this.endRunTime+'\n';
	
	if(this.stderr !== '') 
		out+='stderr:          ' + this.stderr+'\n';
	
	if(this.stdout !== '')
		out+='stdout:          ' + this.stdout+'\n';
	
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

	cl.task = this.task;
	cl.state = this.state;
	return cl;
}

Job.prototype.run = function () {
	var self = this;
	self.startRunTime = new Date();
	cp.exec(this.command, function (error, stdout, stderr) {
		if(error === null) {
			self.rc = 0; 
			self.state = 'Success';
		}
		else { 
			self.rc = error.code;
			self.state = 'Failure';
		}
		self.stdout = stdout;
		self.stderr = stderr;
		self.endRunTime = new Date();
	});


function Task(name,config) { 
	this.name = name;
	for(var i in config) {
		this[i] = config[i]
	}
	this.active = false;
	this.enabled = true;
	
	this.activeJob = null;
	this.scheduledJob = null;
}

Task.prototype.spawnJob = function() {

	var job = new Job();
	job.command = this.command; 
	job.task = this.name;

	job.scheduledTime = Scheduler.parse(this.schedule);
		
	return job;
}

Task.prototype.toString = function () {
	var out = '';
	out+='---- '+this.name+' ----\n';
	out+='command:      ' + this.command+'\n';
	out+='schedule:     ' + this.schedule+ '\n';
	out+='node:         ' + this.node+ '\n';
	out+='fail policy:  ' + this.failPolicy+ '\n';
	out+='depends:      ' + this.depends+'\n\n';
	if(this.activeJob !== null) {
		out+='-- Active Job --\n';
		out+=this.activeJob.toString()+'\n';
	}
	if(this.scheduledJob !== null) {
		out+='-- Scheduled Job --\n';
		out+=this.scheduledJob.toString()+'\n\n';
	}

	return out;
}


Task.prototype.scheduleJob = function () {
	if(this.enabled) {
		if(this.scheduledJob === null) {

			this.scheduledJob = this.spawnJob();
		}
		/*if(this.activeJob !== null) { 
			if( this.activeJob.state === 'Success' ) {
				this.scheduledJob = this.spawnJob();
				console.log ('Schedueling job: ' + this.name + ' ' + this.scheduledJob.scheduledTime);
			}
		}*/
	}
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
 
		if(job.scheduledTime === null || job.scheduledTime === undefined ) continue;
		
		if( job.scheduledTime.getTime() - now.getTime() <= 0 && job.state === 'Queued') {
			if(task.depends === undefined) {
				
				
				job.state = 'Running';
				task.activeJob = job.clone();
				task.scheduledJob = null;
				task.activeJob.run();
			}
			else {
				var run = true;
				for (var j in task.depends) {
					if(this.queue[task.depends[j]] === undefined) {
						console.log('Invalid Dependency');
						continue;
					}
					run = run && (this.queue[task.depends[j]].activeJob.state === 'Success');
				}
				if(run) {
					job.state = 'Running';
					task.activeJob = job.clone();
					task.scheduledJob = null;
					task.activeJob.run();
				}
				else {
					job.state = 'Waiting';
				}
			}
		}
	}
}

TaskManager.prototype.loadConfig = function (filename) {
	if(this.config === null) {
		this.config = require(filename).Config;
		for( var i in this.config.Tasks) {
			this.queue[i] = new Task(i,this.config.Tasks[i]);
		}
	}
}

TaskManager.prototype.toString = function () {
	var out = '------ Task List ------\n\n';
	for(var i in this.queue) {
		out+= ' - '+i+'\n';
	}
	return out;
}

TaskManager.prototype.jobsString = function () {
	var	out = '\n---- Scheduled ----\n';
	for(var i in this.queue) {
		var task = this.queue[i];
		if(task.scheduledJob !== null) {
			out+= i+':  '+ this.queue[i].scheduledJob.scheduledTime + ' ' + this.queue[i].scheduledJob.state+'\n';	
		}
	}
	out += '\n---- Active ----\n';
	for(var i in this.queue) {
		var task = this.queue[i];
		if(task.activeJob !== null) {
			out+= i+':  '+ this.queue[i].activeJob.scheduledTime + ' ' + this.queue[i].activeJob.state+'\n';	
		}
	}
	return out;
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
