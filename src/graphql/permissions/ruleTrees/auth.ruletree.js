import { not } from 'graphql-shield';
import { isAuthenticated } from '../rules';

export default {
  Mutation: {
    login: not(isAuthenticated)
  }
};
