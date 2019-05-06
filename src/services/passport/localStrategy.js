import { Strategy as LocalStrategy } from 'passport-local';
import { User } from '../../models';

export default new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password',
    session: false
  },
  async (email, password, done) => {
    const user = await User.findOne({ email });

    if (!user) {
      done('Wrong email or password', false);
    }

    if (!(await user.isValidPassword(password))) {
      done('Wrong email or password', false);
    }

    done(false, {
      id: user.id,
      name: user.name
    });
  }
);
