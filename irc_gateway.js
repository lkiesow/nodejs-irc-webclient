var net = require("net");


function parse_msg( text ) {
	var data = text.split( " ", 4 );
	console.log( '--->> ' );
	console.log( data );
	if ( data.length == 4 && data[1] == 'PRIVMSG' ) {
		var user = text.split( '!~' )[0].replace( ':', '' );
		var message = text.replace( /^:[^:]*:/, '' ).replace( /[\n\r]/g, '' );
		var receiver = null;
		/* The person we want to answer (channel or user). */
		if ( data[2].charAt(0) == '#' ) {
			receiver = data[2]; // channel
		} else {
			receiver = user; // user
		}
		return { 
				'valid'    : 1, 
				'user'     : user, 
				'channel'  : data[2], 
				'receiver' : receiver, 
				'message'  : message
			}
	} else {
		// not a valid message
		return { 'valid' : 0 }
	}
}


var stream = new net.Stream;

stream.setTimeout(0);
stream.setEncoding("ascii");


/**
 * \brief This function handles the data received from the IRC server.
 **/
stream.addListener("data", function (data) {

	console.log( '-lk-> ' + data + "\n" );
	if ( data.search( /Message of the Day/ ) != -1 ) {
		stream.write( "JOIN #las-vegas-uos\n" );

	} else {
		var lines = data.split( "\n" );
		for ( var i = 0; i < lines.length; i++ ) {
			if ( lines[i].search( /PING/ ) != -1 ) {
				stream.write( 'PONG ' + lines[i].split( " " )[1] + "\n" );
			} else {
				var msg = parse_msg( lines[i] );
				if ( msg.valid ) {
					console.log( msg );
				}
			}
		}
	}

});

stream.addListener("end", function() {
	console.log( "connection closed.\n" );
});

console.log( 'connecting to irc.freenode.net:6667…' );

stream.connect( 6667, 'irc.freenode.net' );
stream.write( "USER node.js-Bot irc.freenode.net blubb :node.js.bot\n" );
stream.write( "NICK node-js-bot\n" );
