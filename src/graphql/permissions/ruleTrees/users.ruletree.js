import { or } from 'graphql-shield';
import { isAuthenticated, isAdmin, isMe } from '../rules';

export default {
  Query: {
    getMe: isAuthenticated,
    users: isAdmin,
    user: or(isAdmin, isMe)
  },
  Mutation: {
    createUser: isAdmin,
    updateUser: or(isAdmin, isMe),
    deleteUser: isAdmin
  }
};
