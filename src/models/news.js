import mongoose from 'mongoose';

const { String } = mongoose.SchemaTypes;

const NewsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  text: {
    type: String,
    required: true,
    unique: true
  }
});

class NewsClass {}

NewsSchema.loadClass(NewsClass);

export const News = mongoose.model('News', NewsSchema);
