const createBookSchema = {
  type: "object",
  required: [
    "name",
    "description",
    "author",
    "genres",
    "price",
    "pages",
    "publishingDate",
  ],
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    author: { type: "string" },
    genres: { type: "array" },
    price: { type: "number" },
    pages: { type: "number" },
    publishingDate: { type: "string" },
  },
  additionalProperties: false,
};

const postSchema = {
  body: createBookSchema,
  response: {
    200: {
      type: "object",
      properties: {
        _id: { type: "string" },
      },
    },
  },
};

const updateBookSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    author: { type: "string" },
    genres: { type: "array" },
    price: { type: "number" },
    pages: { type: "number" },
    publishingDate: { type: "string" },
  },
  additionalProperties: false,
};

const patchSchema = {
  body: updateBookSchema,
};

module.exports = { postSchema, patchSchema };
