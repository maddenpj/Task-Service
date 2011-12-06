exports.Config = {

    defaultUser: 'prod',

    Tasks : {
	pushDailyToNodes : {
	    command    : '/home/omni/process/research/data/bin/pushDailyDataToNodesTask.py >> /home/omni/log/task.pushDailyToNodes.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 06:00',
	    depends    : ['dataBOD'],
		group	   : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	pushLevel01ToNodes : {
	    command    : '/home/omni/process/research/data/bin/pushLevel01ToNodesTask.py >> /home/omni/log/task.pushLevel01ToNodes.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 06:05',
	    depends    : ['itchBOD'],
		group	   : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	pushLevel00ToNodes : {
	    command    : '/home/omni/process/research/data/bin/pushLevel00ToNodesTask.py >> /home/omni/log/task.pushLevel00ToNodes.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 06:30',
	    depends    : ['itchBOD'],
		group	   : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	push1MinToNodes : {
	    command    : '/home/omni/process/research/data/bin/push1MinToNodesTask.py >> /home/omni/log/task.push1MinToNodes.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 06:45',
	    depends    : ['itchBOD'],
		group	   : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	researchPutnamCreateBOD : {
	    command    : '/home/omni/process/research/strat/putnam/bin/putnamCreateBODTask.py >> /home/omni/log/task.researchPutnamCreateBOD.log 2>&1',
	    runAs      : 'omni',
	    node       : 'node00',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 07:15',
	    depends    : ['dataBOD', 'itchBOD'],
		group	   : 'Research|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	dataBOD : {
	    command    : '/home/prod/process/data/bin/dataBgnOfDayTask.py >> /home/prod/log/task.dataBgnOfDayTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 02:00',
		group	   : 'Prod|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	itchBOD : {
	    command    : '/home/prod/process/data/bin/itchBgnOfDayTask.py >> /home/prod/log/task.itchBgnOfDayTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 02:00',
		group	   : 'Prod|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	itchEOD : {
	    command    : '/home/prod/process/data/bin/itchEndOfDayTask.py /home/prod/data/Itch4X 2 >> /home/prod/log/task.itchEndOfDayTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Tue,Wed,Thu,Fri,Sat at 17:00',
		group	   : 'Prod|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	gsReports : {
	    command    : '/home/prod/process/brokers/GS/bin/getGSReportsTask.py >> /home/prod/log/task.getGSReportsTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Mon,Tue,Wed,Thu,Fri at 06:00',
		group	   : 'Prod|Data',
	    failPolicy : 'enable' //or 'disable'
	},

	putnamBOD : {
	    command    : '/home/prod/process/strat/putnam/bin/putnamBgnOfDayTask.py >> /home/prod/log/task.putnamBgnOfDayTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Mon,Tue,Wed,Thu,Fri at 06:05',
	    depends    : ['dataBOD', 'gsReports'],
		group	   : 'Prod|Putnam',
	    failPolicy : 'enable' //or 'disable'
	},

	inRushCQBOD :  {
	    command    : '/home/prod/process/feeds/inRushCQ/bin/inRushCQBgnOfDayTask.py >> /home/prod/log/task.inRushCQBgnOfDayTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Mon,Tue,Wed,Thu,Fri at 06:15',
	    depends    : ['putnamBOD'],
		group	   : 'Prod|All',
	    failPolicy : 'enable' //or 'disable'
	},

	putnamLOC : {
	    command    : '/home/prod/process/strat/putnam/bin/putnamGetLocatesTask.py >> /home/prod/log/task.putnamGetLocatesTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Mon,Tue,Wed,Thu,Fri at 08:00',
	    depends    : ['putnamBOD'],
		group	   : 'Prod|Putnam',
	    failPolicy : 'enable' //or 'disable'
	},

	putnamEOD : {
	    command    : '/home/prod/process/strat/putnam/bin/putnamEndOfDayTask.py >> /home/prod/log/task.putnamEndOfDayTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Mon,Tue,Wed,Thu,Fri at 18:00',
	    depends    : ['putnamBOD'],
		group	   : 'Prod|Putnam',
	    failPolicy : 'enable' //or 'disable'
	},

	inRushCQEOD : {
	    command    : '/home/prod/process/feeds/inRushCQ/bin/inRushCQEndOfDayTask.py >> /home/prod/log/task.inRushCQEndOfDayTask.log 2>&1',
	    node       : 'prod01',
	    schedule   : 'On Mon,Tue,Wed,Thu,Fri at 18:00',
	    depends    : ['inRushCQBOD'],
		group	   : 'Prod|All',
	    failPolicy : 'enable' //or 'disable'
	}	
    }
}

