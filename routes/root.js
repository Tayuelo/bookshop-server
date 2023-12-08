"use strict";
const bcrypt = require("bcrypt");

module.exports = async function (fastify, opts) {
  const collection = fastify.mongo.db.collection("users");

  fastify.post("/register", async function (req, rep) {
    const { password } = req.body;

    try {
      const hashedPass = await bcrypt.hash(password, 10);
      const user = {
        email: req.body.email,
        password: hashedPass,
      };

      const result = await collection.insertOne(user);

      rep.status(201).send(result);
    } catch (error) {
      rep.status(500).send();
    }
  });

  fastify.post("/login", async function (req, rep) {
    const user = await collection.findOne({
      email: req.body.email,
    });

    if (!user) {
      rep.status(400).send("Cannot find user");
    }

    try {
      const { redis } = fastify;
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        const accessToken = fastify.jwt.sign(user);
        const refreshToken = fastify.jwt.sign(user, {
          expiresIn: "20m",
          key: process.env.REFRESH_TOKEN_SECRET,
        });

        await redis.set(`rt:${user.email}`, refreshToken);

        rep.send({ user: { ...user, accessToken, refreshToken } });
      } else {
        rep.status(400).send("Wrong credentials");
      }
    } catch (error) {
      rep.status(400).send(error);
    }
  });

  fastify.post("/token", async function (req, rep) {
    const refreshToken = req.headers["authorization"].split(" ")[1];

    if (refreshToken === null) return rep.status(401).send("Missing Token");

    try {
      const { redis } = fastify;
      const token = await redis.get(`rt:${req.body.email}`);

      if (!token) return rep.status(403).send("Token invalid");

      await redis.del(`rt:${req.body.email}`);

      await fastify.jwt.verify(
        refreshToken,
        { key: process.env.REFRESH_TOKEN_SECRET },
        async function (err, user) {
          if (err) return rep.status(403).send(err);
          const { iat, exp, ...rest } = user;
          const accessToken = fastify.jwt.sign(rest);
          const refreshToken = fastify.jwt.sign(rest, {
            expiresIn: "20m",
            key: process.env.REFRESH_TOKEN_SECRET,
          });

          await redis.set(`rt:${req.body.email}`, refreshToken);

          return rep.status(201).send({ accessToken, refreshToken });
        }
      );
    } catch (error) {
      return rep.status(500).send(error);
    }
  });

  fastify.get("/user", async function (req, rep) {
    const token = req.headers["authorization"].split(" ")[1];
    if (token === null) return rep.status(401).send();

    try {
      fastify.jwt.verify(
        token,
        { key: process.env.ACCESS_TOKEN_SECRET },
        function (err, user) {
          if (err) return rep.status(403).send(err);
          const { _id, iat, exp, password, ...rest } = user;
          rep.send({ user: rest });
        }
      );
    } catch (error) {
      rep.status(401).send(error);
    }
  });
};
