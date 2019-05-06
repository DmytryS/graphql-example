import sinon from 'sinon';
import 'chai/register-should';
import request from 'supertest-promised';
import { User, News } from '../src/models';
import App from '../src/app';
import config from '../config';
import passportService from '../src/services/passport';

const app = new App(config);
let server;
let sandbox;
let token;

describe('News', () => {
  before(async () => {
    await app.start();
    // eslint-disable-next-line
    server = app.server;
    sandbox = sinon.createSandbox();
  });

  after(async () => {
    await app.stop();
  });

  beforeEach(async () => {
    await app.clearDb();
    sandbox.restore();

    const user = await new User({
      username: 'Vasya',
      email: 'some@mail.com',
      role: 'ADMIN'
    }).save();
    await user.setPassword('Somepass123');

    const responseToken = passportService.signJwtToken({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      role: user.role
    });

    // eslint-disable-next-line
    token = responseToken.token;
  });

  describe('Create', () => {
    it('Should add news', async () => {
      const response = await request(server)
        .post('/graphql')
        .set('authorization', token)
        .send({
          query: `mutation {
          createNews(
            name: "Test Name"
            text: "News Text"
          ) {
            _id
            name
          }
        }
        `
        })
        .end()
        .get('body');

      sinon.assert.match(response, {
        data: {
          createNews: {
            _id: sinon.match.string,
            name: 'Test Name',
            text: 'News Text'
          }
        }
      });
    });
  });

  describe('List', () => {
    it('Should return all news list', async () => {
      const news1 = await new News({
        name: 'News 123',
        text: 'Txt 1'
      }).save();
      const news2 = await new News({
        name: 'News 456',
        text: 'Txt 2'
      }).save();

      const response = await request(server)
        .post('/graphql')
        .set('Authorization', token)
        .send({
          query: `query {
          getAllNews{
            _id
            name
            text
          }
        }
        `
        })
        .end()
        .get('body');

      response.should.eql({
        data: {
          getAllNews: [
            {
              _id: news1._id.toString(),
              name: news1.name,
              text: news1.text
            },
            {
              _id: news2._id.toString(),
              name: news2.name,
              text: news2.text
            }
          ]
        }
      });
    });
  });

  describe('Get', () => {
    it('Should return news by id', async () => {
      const news1 = await new News({
        name: 'News header',
        text: 'Some news text'
      }).save();

      const response = await request(server)
        .post('/graphql')
        .set('authorization', token)
        .send({
          query: `query {
          getNews(
            _id: "${news1._id.toString()}"
          ) {
            _id
            name
            text
          }
        }
        `
        })
        .end()
        .get('body');

      response.should.eql({
        data: {
          getNews: {
            _id: news1._id.toString(),
            name: 'News header',
            text: 'Some news text'
          }
        }
      });
    });
  });

  describe('Update', () => {
    it('Should return updated news', async () => {
      const news1 = await new News({
        name: 'Header 1',
        text: 'text 1'
      }).save();

      const response = await request(server)
        .post('/graphql')
        .set('authorization', token)
        .send({
          query: `mutation {
          updateNews(
            _id: "${news1._id.toString()}",
            name: "Updated news header",
            "text": "Updated text"
          ) {
            _id
            name
            text
          }
        }
        `
        })
        .end()
        .get('body');

      response.should.eql({
        data: {
          updateNews: {
            _id: news1._id.toString(),
            name: 'Updated news header',
            text: 'Updated text'
          }
        }
      });

      const updateNews = await News.findById(news1._id.toString());

      updateNews.name.should.eql('Updated news header');
      updateNews.text.should.eql('Updated text');
    });
  });

  describe('Delete', () => {
    it('Should delete news by id', async () => {
      const newsToDelete = await new News({
        name: 'News header',
        text: 'News text'
      }).save();

      const response = await request(server)
        .post('/graphql')
        .set('authorization', token)
        .send({
          query: `mutation {
          deleteNews(
            _id: "${newsToDelete._id.toString()}"
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
          deleteNews: {
            _id: newsToDelete._id.toString()
          }
        }
      });

      const deletedNews = await News.findById(newsToDelete._id.toString());

      sinon.assert.match(deletedNews, null);
    });
  });
});
