import mongoose from 'mongoose';
import moment from 'moment';

const { String, ObjectId } = mongoose.SchemaTypes;

const actionTypes = {
  values: ['REGISTER', 'RESET_PASSWORD'],
  message: "Action type must be either of 'REGISTER', 'RESET_PASSWORD'"
};
const actionStatuses = {
  values: ['ACTIVE', 'USED', 'EXPIRED'],
  message: "Action type must be either of 'ACTIVE', 'USED', 'EXPIRED'"
};

const ActionSchema = new mongoose.Schema({
  user: {
    type: ObjectId,
    required: true,
    ref: 'User'
  },
  quiz: {
    type: ObjectId,
    ref: 'Quiz'
  },
  type: {
    type: String,
    enum: actionTypes,
    required: true
  },
  status: {
    type: String,
    enum: actionStatuses,
    required: true,
    default: 'ACTIVE'
  },
  expires: {
    type: Date,
    required: true
  }
});

class ActionClass {
  /**
   * Checks if action is active
   * @returns {Boolean} true if action ACTIVE
   */
  isActive() {
    return this.status === 'ACTIVE' && moment().isBefore(this.expires);
  }

  /**
   * Checks if action is used
   * @returns {Boolean} true if action USED
   */
  isUsed() {
    return this.status === 'USED' || moment().isBefore(this.expires);
  }

  /**
   * Sets action status to 'USED'
   * @param {String} candidatePassword candidate password
   * @returns {Promise<Action>} promise which will be resolved when action updated
   */
  async setUsed() {
    this.status = 'USED';
    return this.save();
  }

  /**
   * Checks if action is expired
   * @returns {Boolean} true if action EXPIRED
   */
  isExpired() {
    return this.status === 'EXPIRED' || moment().isBefore(this.expires);
  }

  /**
   * Sets action status to 'EXPIRED'
   * @param {String} candidatePassword candidate password
   * @returns {Promise<Action>} promise which will be resolved when action updated
   */
  async setExpired() {
    this.status = 'EXPIRED';
    return this.save();
  }
}

ActionSchema.loadClass(ActionClass);

export const Action = mongoose.model('Action', ActionSchema);
