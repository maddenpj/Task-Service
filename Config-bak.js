exports.Config = {
	Tasks : {
		uname : {
			command : 'uname -a',
			node : 'prod00',
			schedule : 'every 30 seconds between 11:00 and 16:39 on Mon,Tue',
			failPolicy : 'enable' //or 'disable' 
		},
		echo : {	
			command : 'echo Hello',
			node : 'prod00',
			schedule : 'every 46 seconds between 11:00 and 16:39 on Tue',
			failPolicy : 'enable', //or 'disable'
			depends: ['uname']
		}	
	}
}






