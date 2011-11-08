var parser = require('../bin/Parser.js');
require('datejs');


var Scheduler = {}


function unpack(out) {
	var obj = {};
	for(var i = 0; i < out.length; i++) {
		for(var j in out[i]) {
			obj[j] = out[i][j];
		}
	}
	return obj;
}

function invalid(obj) {
	if(obj.between !== undefined && obj.every === undefined) return true;
	if(obj.every !== undefined && obj.at !== undefined) return true;
	if(obj.on !== undefined && obj.date !== undefined) return true;
	if(obj.date !== undefined && (obj.at === undefined && obj.every === undefined )) return true; 
	
	return false;
}

function parseDate(date) {
	return Date.parse(date.substr(0,4)+'.'+date.substr(4,2)+'.'+date.substr(6));
}

function nextTime(obj,out) {

	var start = new Date(out.getTime());
	var	end = new Date(out.getTime());
	var now = new Date();

	if(obj.between === undefined) {
		start.set({hour: 0, minute: 0});
		end.set({hour: 23, minute: 59, second: 59});
	}
	else if(obj.between !== undefined) {
		var startInt = obj.between[0].split(':');
		var endInt = obj.between[1].split(':');
		start.set( {hour:parseInt(startInt[0],10), minute:parseInt(startInt[1],10)});
		end.set( {hour:parseInt(endInt[0],10), minute:parseInt(endInt[1],10)});
	}
	if(start.getTime() > end.getTime() ) {
		console.log('Invalid between interval');
		return null;
	}
	if(start.getTime() > now.getTime() ) {
		out.setTime(start.getTime());
	}
	else if(now.getTime() > start.getTime() ) {
		if(now.getTime() > end.getTime() ) {
			throw ({err:'Interval already over'});
			return null;
		}
		var factor = 0;
		switch(obj.every[1]) {
			case 'seconds':
			case 'second':
				factor = 1000; break;
			case 'minute':
			case 'minutes':
				factor = 60000; break;
			case 'hour':
			case 'hours':
				factor = 3600*1000; break;
		}
		var num = parseInt(obj.every[0]);
		var delta = Math.ceil((now.getTime() - start.getTime())/(num*factor));
		out.setTime(start.getTime() + factor*delta*num);
	}	
}

function nextAt(obj,out) {
	var time = obj.at.split(':');
	out.set({hour: parseInt(time[0],10), minute: parseInt(time[1],10)});
}



Scheduler.parse = function (parseMe) {
	
	parseMe = parseMe.toLowerCase();
	var out;
	var obj;
	var now = new Date();

	try { 
		var tt = parser.parse(parseMe);
		obj = unpack(tt);
		if(invalid(obj)) return null;
	}
	catch (err) {
		console.log(err);
		return null;
	}
	
	if(obj.date !== undefined) {
		out = parseDate(obj.date);
			
		var eod = new Date(now.getTime());
		eod.set({hour:23,minute:59,second:59});
		
		if(Date.today().isAfter(out)) {
			console.log('Scheduled date already past');
			return null;
		}

		if(obj.at !== undefined) {
			nextAt(obj,out); 
			if(out.isBefore(now) ) {
				console.log('Scheduled time already past');
				return null;
			}
		}
		else if(obj.every !== undefined) {
			try { 
				if(nextTime(obj,out) === null) out = null;
			}
			catch(error) {
				console.log(error);
			}
		}
	
	}
	else if (obj.on !== undefined) {
		out = new Date();
		

		// Monday -> 1, Tuesday -> 2, etc 
		obj.on.sort();
		var potDates = [];
        
		for(var i = 0; i < obj.on.length; i++) {
			var day;
			
			switch(obj.on[i]) {
				case 1: day = 'monday'; break;
				case 2: day = 'tuesday'; break;
				case 3: day = 'wednesday'; break;
				case 4: day = 'thursday'; break;
				case 5: day = 'friday'; break;
				case 6: day = 'saturday'; break;
				case 7: day = 'sunday'; break;
			}

			if(obj.at !== undefined) {
				d =  Date.parse(day +' at '+obj.at);

				if(d.isBefore(out)) {
					d = Date.parse('next '+day);
					nextAt(obj,d);
				}
				potDates.push(d);
			}
			else if(obj.every !== undefined ) {
				d = Date.parse(day);

				if(Date.today().isAfter(d) ) {
					d = Date.parse('next '+day);
				}
				
				try {
					if(nextTime(obj,d) === null) d = null;
				}
				catch(err) {
					d = Date.parse(day);

					if(Date.today().same().day(d)) {
						d = Date.parse('next '+day);
						nextTime(obj,d);
					}
				}
				potDates.push(d);
			}
			
		}
		potDates.sort(function (a,b) {
			if(a === null) return 1;
			if(b === null) return -1;
			return (a.compareTo(b));
		});
		
		out = potDates[0];
	}

	return out;
}

exports.Scheduler = Scheduler;


/*************************************************
	Tests
**************************************************

var now = new Date();

console.log('Now: ' + now.toLocaleString() + '\n');

var UnitTests = [
			'On Mon,Tue,Wed at 14:23',
			'On Mon,Tue,Wed at 09:00',
			'Every 10 Seconds Between 12:00 and 14:00 On Mon,Tue,Wed in Jan',
			'Every 10 seconds Between 02:00 and 04:00 Date 20111101',
			'Every 2 hours Between 09:00 and 16:00 Date 20111101',
			'Every 13 seconds Between 11:14 and 12:15 Date 20111101',
			'Every 10 minutes Date 20111101',
			'At 06:30 Date 20110423',
			'At 16:30 Date 20111101',
			'At 06:30 Date 20111101',
			'At 12:00 Date 20111125',
			'On Mon,Tue,Wed at 11:00',
			'On Mon at 10:00',
			'On Mon at 09:00',
			'On Sun at 09:00',
			'On Tue at 11:00',
			'Every 45 seconds between 12:00 and 14:00 on Monday',
			'Every 45 seconds between 02:00 and 04:00 on Mon,Tue',
			'Every 45 seconds between 20:00 and 04:00 on Mon,Tue',
			'Every 30 seconds between 12:00 and 14:00 on Tuesday',
			'Every 30 seconds between 10:00 and 14:00 on Mon,Tue',
			'Every 46 seconds between 02:00 and 03:39 ON Wed', 
			'Every 46 seconds on Wed', 
			'At 02:00 on Wed'
			];



for(var i = 0; i < UnitTests.length; i++) {

	console.log('\033[34mRunning Test:\033[39m\033[33m ' + UnitTests[i]+'\033[39m\n');

	var out = Scheduler.parse(UnitTests[i]);
	process.stdout.write('\033[31mOutput: \033[39m');
	if(out !== null) { 
		console.log(out.toLocaleString());
	}
	else console.log(out);
	
	console.log('\n\n\033[37mTest complete --------------------------------------- \033[39m\n\n');
}

*/

