import { createApp } from "./app";
import { DefaultApolloClient } from "@vue/apollo-composable";
import { ApolloClient, createHttpLink, InMemoryCache } from "@apollo/client";

export { render };

async function render(pageContext) {
  const app = createApp(pageContext);
  const apolloClient = new ApolloClient({
    link: createHttpLink({
      uri: "http://localhost:3000/graphql",
    }),
    cache: new InMemoryCache().restore(pageContext.initialApolloState),
  });
  app.provide(DefaultApolloClient, apolloClient);
  app.mount("#app");
}

/* To enable Client-side Routing:
export const clientRouting = true
// !! WARNING !! Before doing so, read https://vite-plugin-ssr.com/clientRouting */
