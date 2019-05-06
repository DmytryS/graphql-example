import { rule } from 'graphql-shield';
import { AuthorizationError } from '../../lib/errors';

export const isAuthenticated = rule({ cache: false })(
  // eslint-disable-next-line
  (root, args, ctx, info) => !!ctx.user
    || new AuthorizationError({
      message: 'You must login to do that'
    })
);

export const isAdmin = rule({ cache: false })(
  // eslint-disable-next-line
  (root, args, ctx, info) => ctx.user.role === 'ADMIN'
    || new AuthorizationError({
      message: 'Only admin allowed do that'
    })
);

export const isUser = rule({ cache: false })(
  // eslint-disable-next-line
  (root, args, ctx, info) => ctx.user.role === 'USER'
    || new AuthorizationError({
      message: 'Only user allowed do that'
    })
);

export const isMe = rule()(
  // eslint-disable-next-line
  (root, args, ctx, info) => args.id === ctx.user._id
    || new AuthorizationError({
      message: 'You are not allowed to do that'
    })
);
