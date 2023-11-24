"use strict";

const fp = require("fastify-plugin");

module.exports = fp(async function (fastify, opts) {
  fastify.decorate("authenticate", async function (req, rep) {
    try {
      await req.jwtVerify();
    } catch (error) {
      rep.status(403).send(error);
    }
  });
});
