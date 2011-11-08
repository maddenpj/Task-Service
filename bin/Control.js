var net = require('net');

function Control(prompt_) {
	this.prompt = prompt_ || '\033[1;33mTaskService> \033[22;39m';

	this.commands = {};
}


Control.prototype.start = function (port) {
	this.port = port;
	var self = this;
	net.createServer(function (socket) {
		socket.write(self.prompt);
		socket.on('data', function (data) {
			self.handler(data,socket);
		});
	}).listen(this.port);

}


Control.prototype.handler = function (data,socket) { 
	var parse = data.toString().substring(0, data.length-1).split(/\s+/g);
	
	var command = parse.shift();
	
	if(parse[0] === '') parse.shift();

	if( this.commands[command] === undefined) { 
		socket.write('\n'+this.prompt);
		return;
	}
	var out = this.commands[command].apply(this, parse); 
	socket.write(out+'\n'+this.prompt); 
}


Control.prototype.register = function(name, callback) {
	this.commands[name] = callback;
}

exports.Control = Control;

/* Tests
var control = new Control(6666);
control.start();

control.register('menu', function () {
	menuString = '\n------------Menu\n\n';
	return menuString;
});
control.register('A', function (a) {
	menuString = '\nA' + a;
	return menuString;
});
control.register('B', function (b,c) {
	menuString = b + ' | ' + c;
	return menuString;
});
*/
