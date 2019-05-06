import { shield } from 'graphql-shield';
import ruleTree from './ruleTrees';

const permissions = shield(ruleTree);

export default permissions;
