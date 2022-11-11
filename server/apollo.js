const { ApolloServer } = require("@apollo/server");

module.exports.createApolloServer = () => {
  return new ApolloServer({
    typeDefs: `#graphql
        type Query {
            hello: String!
        }
        `,
    resolvers: {
      Query: {
        hello: () => "world",
      },
    },
  });
};
