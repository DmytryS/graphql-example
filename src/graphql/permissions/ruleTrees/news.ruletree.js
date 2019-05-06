import { isAdmin, isAuthenticated } from '../rules';

export default {
  Query: {
    getNews: isAuthenticated,
    getAllNews: isAuthenticated
  },
  Mutation: {
    createNews: isAdmin,
    updateNews: isAdmin,
    deleteNews: isAdmin
  }
};
