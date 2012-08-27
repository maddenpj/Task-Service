exports.Config = {

    defaultUser: 'user',
	datesFile  : '/home/data/Static/Dates',

    Tasks : {
	
	uptime : {
	    command    : 'uptime'
	    runAs      : 'user',
	    node       : 'localhost',
	    schedule   : 'On Mon,Tue,Wed,Thu,Fri,Sat,Sun at 00:05',
 	    group      : 'Local|Testing',
	    failPolicy : 'enable' 
	},
	
	uname : {
	    command    : 'uname -a'
	    node       : 'localhost',
	    schedule   : 'T+0 at 07:15',
 	    group      : 'Local|Testing',
		depends    : ['uptime'],
	    failPolicy : 'enable' //or 'disable'
	}
	}
}
