"use strict";

const { postSchema, patchSchema } = require("../../schemas/book-schema.js");
const { ObjectId } = require("@fastify/mongodb");

module.exports = async function (fastify, opts) {
  const collection = fastify.mongo.db.collection("books");

  fastify.get(
    "/books",
    { onRequest: [fastify.authenticate] },
    async function (request, reply) {
      console.log(request.user); // Access the user data
      let query = {};
      const { search } = request.query;
      if (search) {
        query = {
          name: { $regex: search },
        };
      }

      const result = await collection.find(query).toArray();
      return result;
    }
  );

  fastify.get(
    "/books/:id",
    { onRequest: [fastify.authenticate] },
    async function (req, rep) {
      const result = await collection.findOne({
        _id: new ObjectId(req.params.id),
      });
      return result;
    }
  );

  fastify.post(
    "/books",
    { schema: postSchema, onRequest: [fastify.authenticate] },
    async function (req, rep) {
      const book = req.body;
      const result = await collection.insertOne(book);
      return { _id: result.insertedId };
    }
  );

  fastify.delete(
    "/books/:id",
    { onRequest: [fastify.authenticate] },
    async function (req, rep) {
      const result = await collection.deleteOne({
        _id: new ObjectId(req.params.id),
      });
      return result.deletedCount > 0;
    }
  );

  fastify.patch(
    "/books/:id",
    { schema: patchSchema, onRequest: [fastify.authenticate] },
    async function (req, rep) {
      const result = await collection.findOneAndUpdate(
        {
          _id: new ObjectId(req.params.id),
        },
        {
          $set: { ...req.body },
        },
        {
          returnNewDocument: true,
          returnDocument: "after",
        }
      );
      return result;
    }
  );
};
