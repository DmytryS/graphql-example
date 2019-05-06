import { ApolloServer } from 'apollo-server-express';
import { applyMiddleware } from 'graphql-middleware';
import { makeExecutableSchema } from 'graphql-tools';
import {
  isInstance as isApolloErrorInstance,
  formatError as formatApolloError
} from 'apollo-errors';
import log4js from 'log4js';
import resolvers from './resolvers';
import typeDefs from './schemas';
import permissions from './permissions';
import passport from '../services/passport';

const logger = log4js.getLogger('Apollo Service');

const schema = makeExecutableSchema({ resolvers, typeDefs });
const schemaWithMiddleware = applyMiddleware(schema, permissions);

function formatError(error) {
  const { originalError } = error;
  if (isApolloErrorInstance(originalError)) {
    logger.error({
      type: 'error',
      message: originalError.message,
      data: originalError.data,
      internalData: originalError.internalData,
      stack: originalError.stack
    });
  }
  return formatApolloError({
    type: 'error',
    message: error.message,
    data: error.data
  });
}

const apolloServer = new ApolloServer({
  schema: schemaWithMiddleware,
  graphiql: process.env.NODE_ENV === 'development',
  playground: {
    settings: {
      'editor.theme': 'dark'
    }
  },
  context: ({ req }) => {
    const token = req.headers.authorization || '';
    let user;

    try {
      user = passport.verifyJwtToken(token);
    } catch (error) {
      user = false;
    }

    return {
      ...req,
      user
    };
  },
  formatError
});

export default apolloServer;
