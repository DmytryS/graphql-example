import { NotFoundError } from '../../lib/errors';
import { Action } from '../../models';
import mailer from '../../services/mailer';

export default {
  Query: {
    // eslint-disable-next-line
    action: async (root, args, ctx) => {
      const { _id } = args;
      const action = await Action.findById(_id).populate('user');

      if (!action || !action.isActive()) {
        throw new NotFoundError({
          message: `Action with specified id of ${_id} not found`,
          data: {
            _id
          }
        });
      }

      return action;
    }
  },
  Mutation: {
    // eslint-disable-next-line
    runAction: async (root, args, ctx) => {
      const { password, _id: actionId } = args;

      let action = await Action.findById(actionId).populate('user');

      if (!action || !action.isActive()) {
        throw new NotFoundError({
          message: `Action with specified id of ${actionId} not found`,
          data: {
            actionId
          }
        });
      }

      await action.user.setPassword(password);

      action = await action.setUsed();

      await mailer.send(action.user.email, 'NOTIFICATION', {
        username: action.user.username,
        subject: 'Your password successfully set',
        messsage:
          'Your password successfully set. Now you can login with your new password'
      });

      return action;
    }
  }
};
