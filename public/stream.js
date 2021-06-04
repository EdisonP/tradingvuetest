function initWebSocket() {

    var connection = new WebSocket('wss://wss.elcacamente.com');
    var cb = () => {};

    connection.onopen = function() {
        connection.send('Ping'); // Send the message 'Ping' to the server
        self.postMessage('open')
    };

    // Log errors
    connection.onerror = function(error) {
        console.log('WebSocket Error ' + error);
        connection.close()
    };

    connection.onclose = (code, reason) => {
        console.log('Websocket connection closed')
        console.log(code, reason)
        self.postMessage('close')
        setTimeout(initWebSocket, 1000)
    }

    // Log messages from the server
    connection.onmessage = function(data) {
        const PING = 57;
        const PONG = new Uint8Array(['A'.charCodeAt()]);

        connection.binaryType = 'arraybuffer';

        if (typeof data.data !== 'string') {
            // transform it to Uint8Array
            let buffer = new Uint8Array(data.data);

            // Check if it is actually ping from the server
            if (buffer.length === 1 && buffer[0] === PING) {
                // this is definitely `ping` event you can call custom on ping handler 
                // also must send back immediately pong to the server 
                // otherwise server will disconnect this client
                return connection.send(PONG);
            }
        }

        try {
            data = JSON.parse(data.data);
            cb(data);
            self.postMessage(data)
                //console.log('Server said: ', data);
        } catch (e) {
            console.log(e.toString());
        }
    };

}

self.addEventListener('message', function(e) {
    switch (e.data) {
        case 'init':
            initWebSocket();
            break;
        default:
            self.postMessage('Unknown command: ' + e.data);
    }
}, false);