async function runServer() {
  const {default: phpServer} = await import('php-server');
  // phpServer.default();

  const server = await phpServer();
  console.log(server);
  console.log(`PHP Server running at ${server.url}`);
}

runServer();