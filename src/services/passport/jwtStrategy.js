import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import { User } from '../../models';
import config from '../../../config';

export default new JwtStrategy(
  {
    jwtFromRequest: ExtractJwt.fromHeader('Authorization'),
    secretOrKey: config.AUTH.secret,
    session: false
  },
  async (tokenObject, done) => {
    if (!tokenObject || !tokenObject.id) {
      done('Wrong token', false);
    }

    const user = await User.findById(tokenObject.id);

    if (!user) {
      done('Wrong token', false);
    }

    done(false, {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    });
  }
);
