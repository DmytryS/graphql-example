import { fileLoader, mergeTypes } from 'merge-graphql-schemas';

const typeDefs = fileLoader(`${__dirname}/*.graphql`);

export default mergeTypes(typeDefs, { all: true });
