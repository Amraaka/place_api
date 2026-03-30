import mongoose from 'mongoose';

const placeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      lng: {
        type: Number,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    people: {
      type: Number,
      default: 0,
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

const Place = mongoose.model('Place', placeSchema);

export default Place;
