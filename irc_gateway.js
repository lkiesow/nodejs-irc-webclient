var net = require("net");
var app = require('http').createServer(handler)
, io = require('socket.io').listen(app)
, fs = require('fs')


var port = process.argv.length == 3 ? Number( process.argv[2] ) : 8080;

/**
 * \brief Webserver to deliver client files.
 * @param req the request
 * @param res the response
 */
app.listen( port );
function handler (req, res) {
	fs.readFile(__dirname + '/irc_client.html',
			function (err, data) {
				if (err) {
					res.writeHead(500);
					return res.end('Error loading index.html');
				}
				res.setHeader( 'Content-Type', 'text/html;charset=UTF-8' );
				res.writeHead(200);
				res.end(data);
			});
}


/**
 * \brief This function handles the connection to the clients.
 */
io.sockets.on('connection', function (webSocket) {
	var tcpStream = new net.Stream;
	tcpStream.setTimeout(0);
	tcpStream.setEncoding("ascii");
	webSocket.on('message', function (message) {
		try
		{
			if(message.split(' ')[0] == 'CONNECT')
			{
				//connect to the given IRC server via TCP
				var host = message.split(' ')[1].split(':')[0];
				var port = message.split(' ')[1].split(':')[1];
				console.log( 'connecting to '+host+':'+port+'…' );
				tcpStream.destroy();
				tcpStream.connect( port, host );
			}
			else
			{
				//forward message to the remote server via TCP
				tcpStream.write(message);
			}
		}
		catch (e)
		{
			webSocket.send(e);
		}
	});
	/**
	 * \brief this function closes the connection to the IRC server when the connection to the client is closed.
	 */
	webSocket.on('disconnect', function () {
		tcpStream.end();
	});

	/**
	 * \brief This function forwards error messages to the client
         */
	tcpStream.addListener("error", function (error){
		//forward error message to websocket
		webSocket.send(error+"\r\n");
	});
	/**
	 * \brief This function handles the data received from the IRC server.
	 **/
	tcpStream.addListener("data", function (data) {
		//forward data to websocket
		webSocket.send(data);
	});
	
	
	/**
	 * \brief This function notifies the client when the connection to the server is closed.
	 **/
	tcpStream.addListener("close", function (){
		webSocket.send("Server closed connection. You are offline. Use /connect to connect.");
	});
});




