"use strict";

const path = require("node:path");
const AutoLoad = require("@fastify/autoload");
const cors = require("@fastify/cors");

// Pass --options via CLI arguments in command to enable these options.
const options = {};

module.exports = async function (fastify, opts) {

  fastify.register(require("@fastify/jwt"), {
    secret: process.env.ACCESS_TOKEN_SECRET,
    sign: {
      expiresIn: '15s',
    }
  });

  fastify.register(cors);

  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "db"),
    options: Object.assign({}, opts),
  });

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "plugins"),
    options: Object.assign({}, opts),
  });

  // This loads all plugins defined in routes
  // define your routes in one of these
  fastify.register(AutoLoad, {
    dir: path.join(__dirname, "routes"),
    options: Object.assign({}, opts),
  });
};

module.exports.options = options;