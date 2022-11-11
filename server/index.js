const express = require("express");
const compression = require("compression");
const { renderPage } = require("vite-plugin-ssr");
const { createApolloServer } = require("./apollo");
const { expressMiddleware } = require("@apollo/server/express4");
const { ApolloClient } = require("@apollo/client");
const { createHttpLink } = require("@apollo/client");
const { InMemoryCache } = require("@apollo/client");

const isProduction = process.env.NODE_ENV === "production";
const root = `${__dirname}/..`;

startServer();

async function startServer() {
  const app = express();

  app.use(compression());

  if (isProduction) {
    const sirv = require("sirv");
    app.use(sirv(`${root}/dist/client`));
  } else {
    const vite = require("vite");
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true },
      })
    ).middlewares;
    app.use(viteDevMiddleware);
  }

  const apolloServer = createApolloServer();

  await apolloServer.start();

  app.use("/graphql", express.json(), expressMiddleware(apolloServer));

  app.get("*", async (req, res, next) => {
    const pageContextInit = {
      urlOriginal: req.originalUrl,
      apolloClient: new ApolloClient({
        link: createHttpLink({
          uri: "http://localhost:3000/graphql",
        }),
        cache: new InMemoryCache(),
        ssrMode: true,
      }),
    };
    const pageContext = await renderPage(pageContextInit);
    const { httpResponse } = pageContext;
    if (!httpResponse) return next();
    const { body, statusCode, contentType } = httpResponse;
    res.status(statusCode).type(contentType).send(body);
  });

  const port = process.env.PORT || 3000;
  app.listen(port);
  console.log(`Server running at http://localhost:${port}`);
}
