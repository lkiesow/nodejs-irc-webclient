var net = require("net");
var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')



/**
 * Webserver to deliver client files 
 * @param req
 * @param res
 */
app.listen(80);
function handler (req, res) {
fs.readFile(__dirname + '/irc_client.html',
function (err, data) {
  if (err) {
    res.writeHead(500);
    return res.end('Error loading index.html');
  }
  res.writeHead(200);
  res.end(data);
});
}


/**
 * 
 */
io.sockets.on('connection', function (webSocket) {
	var tcpStream = new net.Stream;
	tcpStream.setTimeout(0);
	tcpStream.setEncoding("ascii");
	webSocket.on('message', function (message) {
		if(message.split(' ')[0] == 'CONNECT')
		{
			//connect to the given server via tcp
			var host = message.split(' ')[1].split(':')[0];
			var port = message.split(' ')[1].split(':')[1];
			console.log( 'connecting to '+host+':'+port+'…' );
					tcpStream.connect( port, host );
		}
		else
		{
			//forward message to the remote server via tcp
			tcpStream.write(message);
		}
	});
	/**
	 * \brief This function handles the data received from the IRC server.
	 **/
	tcpStream.addListener("data", function (data) {
		//forward data to webSocket
		webSocket.send(data);
	});
});




