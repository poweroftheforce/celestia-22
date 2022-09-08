// async function runServer() {
//   const {default: phpServer} = await import('php-server');
//   // phpServer.default();

//   const server = await phpServer();
//   console.log(server);
//   console.log(`PHP Server running at ${server.url}`);
// }

// runServer();

var phpServer = require("node-php-server");
 
// Create a PHP Server
phpServer.createServer({
    port: 8000,
    hostname: '127.0.0.1',
    base: '.',
    keepalive: false,
    open: false,
    bin: 'php',
    router: __dirname + '/server.php'
});

// Close server
// phpServer.close();
