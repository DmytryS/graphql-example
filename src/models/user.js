import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import config from '../../config';

const { String } = mongoose.SchemaTypes;

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minLength: 3,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minLength: 3,
    trim: true
  },
  role: {
    type: String,
    enum: ['ADMIN', 'USER'],
    required: true
  },
  passwordHash: {
    type: String
  }
});

class UserClass {
  /**
   * Checks user password
   * @param {String} candidatePassword candidate password
   * @returns {Promise<Boolean>} promise which will be resolved when password compared
   */
  async isValidPassword(candidatePassword) {
    if (!candidatePassword) {
      return false;
    }
    if (!this.passwordHash) {
      return false;
    }
    return bcrypt.compare(candidatePassword, this.passwordHash);
  }

  /**
   * Sets user password
   * @param {String} password password to set
   * @returns {Promise<>} promise which will be resolved when password set
   */
  async setPassword(password) {
    if (password) {
      this.passwordHash = await bcrypt.hash(password, config.AUTH.saltRounds);
    } else {
      this.passwordHash = undefined;
    }
    return this.save();
  }
}

UserSchema.loadClass(UserClass);

export const User = mongoose.model('User', UserSchema);
