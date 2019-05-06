import { User } from '../../models';

export default {
  Query: {
    // eslint-disable-next-line
    user(root, args, ctx) {
      return User.findById(args.id, null, { lean: true });
    },
    // eslint-disable-next-line
    users(root, args, ctx) {
      return User.find({}, null, { lean: true });
    },
    getMe: async (root, args, ctx) => User.findById(ctx.user._id, null, { lean: true })
  },
  Mutation: {
    // eslint-disable-next-line
    createUser(root, { input }, ctx) {
      return User.findOne({
        $or: [{ username: input.username }, { email: input.email }]
      })
        .then((user) => {
          if (user) {
            const isUsernameMatch = user.username === input.username;
            const isEmailMatch = user.email === input.email;
            let msgMatching = '';

            if (isUsernameMatch) msgMatching += 'username';
            if (isUsernameMatch && isEmailMatch) msgMatching += ' and ';
            if (isEmailMatch) msgMatching += 'email';

            const errMsg = `User with this ${msgMatching} already exists`;
            throw new Error(errMsg);
          }
          return null;
        })
        .then(() => {
          const { username, email } = input;
          const user = new User({ username, email });

          return user.setPassword(input.password);
        });
    },
    // eslint-disable-next-line
    updateUser(root, { input }, ctx) {
      return User.findOne({
        $or: [{ username: input.username || '' }, { email: input.email || '' }]
      })
        .then((user) => {
          if (user && user.id !== input.id) {
            const isUsernameMatch = user.username === input.username;
            const isEmailMatch = user.email === input.email;
            let msgMatching = '';

            if (isUsernameMatch) msgMatching += 'username';
            if (isUsernameMatch && isEmailMatch) msgMatching += ' and ';
            if (isEmailMatch) msgMatching += 'email';

            const errMsg = `User with this ${msgMatching} already exists`;

            throw new Error(errMsg);
          }
          return null;
        })
        .then(() => User.findOneAndUpdate({ _id: input.id }, input, {
          new: true,
          runValidators: true,
          strict: true,
          lean: true
        }));
    },
    deleteUser(
      root,
      {
        input: { id }
      },
      // eslint-disable-next-line
      ctx
    ) {
      return User.findByIdAndDelete(id);
    }
  }
};
