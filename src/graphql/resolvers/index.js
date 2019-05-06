import { fileLoader, mergeResolvers } from 'merge-graphql-schemas';

const resolvers = fileLoader(`${__dirname}/*.resolver.js`);

export default mergeResolvers(resolvers);
