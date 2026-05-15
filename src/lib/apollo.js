import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import { setContext } from "@apollo/client/link/context";

function isPrivateNetworkHost(hostname) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.startsWith("192.168.") ||
    /^10\./.test(hostname) ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

function getDefaultGraphQLEndpoint() {
  if (typeof window !== "undefined" && isPrivateNetworkHost(window.location.hostname)) {
    return `${window.location.protocol}//${window.location.hostname}/wordpress/graphql`;
  }

  return "https://mtj.ivk.mybluehost.me/website_cf306033/graphql";
}

const GRAPHQL_ENDPOINT = import.meta.env.VITE_GRAPHQL_ENDPOINT || getDefaultGraphQLEndpoint();

const GRAPHQL_JWT_KEY = "jeea_graphql_jwt";

function getStoredAuthToken() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(GRAPHQL_JWT_KEY) || "";
}

function setStoredAuthToken(token) {
  if (typeof window === "undefined") {
    return;
  }

  if (token) {
    window.localStorage.setItem(GRAPHQL_JWT_KEY, token);
  } else {
    window.localStorage.removeItem(GRAPHQL_JWT_KEY);
  }
}

function clearStoredAuthToken() {
  setStoredAuthToken("");
}

const authLink = setContext((_, { headers }) => {
  const token = getStoredAuthToken();

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

const apolloClient = new ApolloClient({
  link: authLink.concat(
    new HttpLink({
      uri: GRAPHQL_ENDPOINT,
      credentials: "omit",
    })
  ),
  cache: new InMemoryCache(),
});

export { GRAPHQL_ENDPOINT, GRAPHQL_JWT_KEY, clearStoredAuthToken, getStoredAuthToken, setStoredAuthToken };
export default apolloClient;