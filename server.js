'use strict';

import hapi from '@hapi/hapi';
import inert from '@hapi/inert';
import path from 'path'
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const start = async () => {

  const server = hapi.server({
    port: 3002,
    host: 'localhost',
    routes: {
      files: {
        relativeTo: __dirname
      }
    }
  });

  server.ext('onPreResponse', (request, h) => {
    const statusCode = request.response.statusCode ?? request.response.output?.statusCode ?? -1;
    console.log(`${request.method} ${statusCode} ${request.path}`)

    return h.continue;
  })

  await server.register(inert);

  server.route({
    method: 'GET',
    path: '/tools/{param*}',
    handler: {
      directory: {
        path: 'dist',
        index: ['index.html']
      }
    }
  });

  await server.start();

  console.log('Server running at:', server.info.uri);
};

start();
