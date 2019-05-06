import passport from 'passport';
import moment from 'moment';
import * as jwt from 'jsonwebtoken';
import { AuthorizationError } from '../../utils/errors';
import localStrategy from './localStrategy';
import jwtStrategy from './jwtStrategy';
import config from '../../../config';

passport.use(localStrategy);
passport.use(jwtStrategy);

export default {
  initialize: () => passport.initialize(),
  authenticateJwt: (req, res, next) => {
    passport.authenticate(
      'jwt',
      {
        session: false
      },
      (err, user, info) => {
        if (err) {
          next(new AuthorizationError({ message: err.message ? err.message : err }));
        }

        if (!user) {
          next(new AuthorizationError({ message: info }));
        }

        req.user = user;
        next();
      }
    )(req, res, next);
  },
  authenticateCredentials: req => new Promise((resolve, reject) => passport.authenticate(
    'local',
    {
      session: false
    },
    (err, user) => {
      if (err) {
        reject(
          new AuthorizationError({
            message: err.message ? err.message : err
          })
        );
      }

      return resolve(user);
    }
  )(req)),
  signJwtToken: (objectToSign) => {
    const expires = moment()
      .add(parseInt(config.AUTH.expiresIn.slice(0, -1), 10), config.AUTH.expiresIn.slice(-1))
      .toDate();
    const token = jwt.sign(objectToSign, config.AUTH.secret, {
      expiresIn: config.AUTH.expiresIn
    });

    return { token, expires };
  },
  verifyJwtToken: (token) => {
    try {
      const decodedToken = jwt.verify(token, config.AUTH.secret);

      return decodedToken;
    } catch (err) {
      throw new AuthorizationError({ message: 'Malformed JWT token' });
    }
  },
  refreshJwtToken: refreshToken => ({
    token: refreshToken,
    message: 'TODO'
  })
};
