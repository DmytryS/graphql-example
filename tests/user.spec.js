import sinon from 'sinon';
// import { expect } from 'chai';
import request from 'supertest-promised';
import { User } from '../src/models';
import App from '../src/app';
import config from '../config';
import mailer from '../src/services/mailer';
import passportService from '../src/services/passport';

const app = new App(config);
let server;
let sandbox;

describe('Users', () => {
  before(async () => {
    await app.start();
    // eslint-disable-next-line
    server = app.server;
    sandbox = sinon.createSandbox();
  });

  after(async () => {
    await app.stop();
  });

  afterEach(() => {
    sandbox.restore();
  });

  beforeEach(async () => {
    await app.clearDb();
    sandbox.restore();
  });

  describe('SignIn', () => {
    it('Should return token when signedin', async () => {
      const user = await new User({
        username: 'Vasya',
        email: 'some@mail.com',
        role: 'USER'
      }).save();
      await user.setPassword('Somepass123');

      const response = await request(server)
        .post('/graphql')
        .send({
          query: `mutation {
          login(
            login: "some@mail.com", password: "Somepass123"
          ) {
            token
          }
        }
        `
        })
        .end()
        .get('body');

      sinon.assert.match(response, {
        data: {
          login: {
            token: sinon.match.string
          }
        }
      });
    });
  });

  describe('RegisterUser', () => {
    it('Should return userId and send email if registered new user', async () => {
      const mailerStub = sandbox
        .stub(mailer, 'send')
        .returns(Promise.resolve());

      const response = await request(server)
        .post('/graphql')
        .send({
          query: `mutation {
            signup(
              username: "Petya"
              email: "some_petya@mail.com"
            ) {
              _id
            }
          }
        `
        })
        .end()
        .get('body');

      sinon.assert.match(response, {
        data: {
          signup: {
            _id: sinon.match.string
          }
        }
      });

      sinon.assert.calledOnce(mailerStub);
      sinon.assert.calledWith(mailerStub, 'some_petya@mail.com', 'REGISTER', {
        username: 'Petya',
        role: 'USER',
        actionId: sinon.match.string
      });
    });
  });

  describe('GetMe', () => {
    it('Should return user info if signed in', async () => {
      let user = await new User({
        username: 'Vasya',
        email: 'some@mail.com',
        role: 'USER'
      }).save();
      user = await user.setPassword('Somepass123');
      const { token } = passportService.signJwtToken({
        _id: user._id.toString(),
        username: user.username,
        email: user.email,
        role: user.role
      });

      const response = await request(server)
        .post('/graphql')
        .set('authorization', token)
        .send({
          query: `query {
              getMe{
                _id
                username
                email
                role
              }
            }
          `
        })
        .end()
        .get('body');

      sinon.assert.match(response, {
        data: {
          getMe: {
            _id: user._id.toString(),
            username: 'Vasya',
            email: 'some@mail.com',
            role: 'USER'
          }
        }
      });
    });

    it('Should return error if unauthorized', async () => {
      const response = await request(server)
        .post('/graphql')
        .set('authorization', 'WRONG_TOKEN')
        .send({
          query: `query {
              getMe{
                _id
                username
                email
                role
              }
            }
          `
        })
        .end()
        .get('body');

      sinon.assert.match(response, {
        errors: [
          {
            type: 'error',
            message: 'You must login to do that'
          }
        ],
        data: null
      });
    });
  });
});
