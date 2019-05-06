import { News } from '../../models';
import { NotFoundError } from '../../utils/errors';

export default {
  Query: {
    // eslint-disable-next-line
    getAllNews: async (root, args, ctx) => {
      const categories = await News.find({});

      return categories;
    },
    // eslint-disable-next-line
    getNews: async (root, args, ctx) => {
      const { _id: newsId } = args;
      const news = await News.findById(newsId, null, {
        lean: true
      });

      if (!news) {
        throw new NotFoundError({
          message: `News with specified id of ${newsId} not found`
        });
      }

      return news;
    }
  },
  Mutation: {
    // eslint-disable-next-line
    createNews: async (root, args, ctx) => {
      const { name, text } = args;

      const newNews = await new News({
        name,
        text
      }).save();

      return newNews;
    },
    // eslint-disable-next-line
    updateNews: async (root, args, ctx) => {
      const { _id: newsId, name, text } = args;

      const news = await News.findById(newsId);

      if (!news) {
        throw new NotFoundError({
          message: `News with specified id of ${newsId} not found`
        });
      }

      news.name = name;
      news.text = text;

      return news.save();
    },
    // eslint-disable-next-line
    deleteNews: async (root, args, ctx) => {
      const { _id: newsId } = args;
      const news = await News.findById(newsId);

      if (!news) {
        throw new NotFoundError({
          message: `News with specified id of ${newsId} not found`
        });
      }

      return news.remove();
    }
  }
};
