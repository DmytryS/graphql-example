import usersRuleTree from './users.ruletree';
import authRuleTree from './auth.ruletree';
import newsRuleTree from './news.ruletree';

export default {
  Query: {
    ...usersRuleTree.Query,
    ...newsRuleTree.Query
  },
  Mutation: {
    ...usersRuleTree.Mutation,
    ...authRuleTree.Mutation,
    ...newsRuleTree.Mutation
  }
};
