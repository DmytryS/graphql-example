import moment from 'moment';
import { AuthorizationError } from '../../lib/errors';
import { User, Action } from '../../models';
import passportService from '../../services/passport';
import mailer from '../../services/mailer';

export default {
  Query: {
    // refresh: (root, args) => {
    //   const { refreshToken } = args.input;
    //   return passportService.refreshJwtToken(refreshToken);
    // }
  },
  Mutation: {
    signup: async (root, args) => {
      const { username, email, password } = args;
      const role = 'USER';

      const existingUser = await User.findOne({
        $or: [{ username, role }, { email, role }]
      });

      if (existingUser) {
        const isUsernameMatch = existingUser.username === args.input.username;
        const isEmailMatch = existingUser.email === args.input.email;
        const errMsg = `${role} with this ${isUsernameMatch
          && 'username'} ${isUsernameMatch
          && isEmailMatch
          && 'or'} ${isEmailMatch && 'email'} already exists`;
        throw new Error(errMsg);
      }

      const newUser = await new User({
        username,
        email,
        password,
        role
      }).save();

      const action = await new Action({
        type: 'REGISTER',
        user: newUser._id,
        expires: moment()
          .add(1, 'day')
          .toDate()
      }).save();

      await mailer.send(newUser.email, 'REGISTER', {
        username: newUser.username,
        role: newUser.role,
        actionId: action._id.toString()
      });

      // newUser = await newUser.setPassword(password);

      return {
        _id: newUser._id
      };
    },
    login: async (root, args) => {
      const { password, login } = args;
      const user = await User.findOne({
        $or: [{ username: login }, { email: login }]
      });

      if (!user) {
        throw new AuthorizationError({ message: 'Wrong username or email' });
      }

      if (!(await user.isValidPassword(password))) {
        throw new AuthorizationError({ message: 'Wrong password' });
      }

      return passportService.signJwtToken({
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      });
    }
  }
};
