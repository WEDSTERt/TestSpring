import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Убедимся, что переменная определена, иначе fallback на '/graphql'
const graphqlUri = import.meta.env.VITE_GRAPHQL_URL || '/graphql';

const httpLink = createHttpLink({
    uri: graphqlUri,
});

const authLink = setContext((_, { headers }) => {
    const token = localStorage.getItem('authToken');
    return {
        headers: {
            ...headers,
            authorization: token ? `Bearer ${token}` : '',
        },
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});