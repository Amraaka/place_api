import express from 'express';
import mongoose from 'mongoose';
import Place from '../models/place.model.js';

const router = express.Router();

const toPublicPlace = (place) => ({
  id: place._id.toString(),
  title: place.title,
  description: place.description,
  address: place.address,
  location: place.location,
  imageUrl: place.imageUrl,
  creator: place.creator?._id?.toString?.() || place.creator?.toString?.() || '',
  people: place.people || 0,
  creatorName: place.creator?.name || '',
});

router.get('/user/:uid', async (req, res, next) => {
  try {
    const { uid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(uid)) {
      return res.status(400).json({ message: 'Invalid user id.' });
    }

    const places = await Place.find({ creator: uid })
      .populate('creator', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({ places: places.map(toPublicPlace) });
  } catch (error) {
    next(error);
  }
});

router.get('/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ message: 'Invalid place id.' });
    }

    const place = await Place.findById(pid).populate('creator', 'name');
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    res.status(200).json({ place: toPublicPlace(place) });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const {
      title,
      description,
      address,
      imageUrl,
      creator,
      creatorId,
      people,
      location,
      lat,
      lng,
      longitude,
      latitude,
    } = req.body;

    const resolvedCreator = creator || creatorId;

    if (!title?.trim() || !description?.trim() || !address?.trim() || !imageUrl?.trim() || !resolvedCreator) {
      return res.status(400).json({
        message: 'title, description, address, imageUrl and creator are required.',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(resolvedCreator)) {
      return res.status(400).json({ message: 'Invalid creator id.' });
    }

    const resolvedLng = Number(location?.lng ?? lng ?? longitude);
    const resolvedLat = Number(location?.lat ?? lat ?? latitude);

    if (!Number.isFinite(resolvedLng) || !Number.isFinite(resolvedLat)) {
      return res.status(400).json({ message: 'Valid location (lng, lat) is required.' });
    }

    const place = await Place.create({
      title: title.trim(),
      description: description.trim(),
      address: address.trim(),
      imageUrl: imageUrl.trim(),
      creator: resolvedCreator,
      location: { lng: resolvedLng, lat: resolvedLat },
      people: people || 0,
    });

    const hydrated = await place.populate('creator', 'name');
    res.status(201).json({ place: toPublicPlace(hydrated) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ message: 'Invalid place id.' });
    }

    const updates = {};
    const updatableFields = ['title', 'description', 'address', 'imageUrl', 'people'];
    for (const field of updatableFields) {
      if (typeof req.body[field] === 'string') {
        updates[field] = req.body[field].trim();
      }
    }

    const hasLocation = req.body.location || req.body.lng || req.body.lat || req.body.longitude || req.body.latitude;
    if (hasLocation) {
      const resolvedLng = Number(req.body.location?.lng ?? req.body.lng ?? req.body.longitude);
      const resolvedLat = Number(req.body.location?.lat ?? req.body.lat ?? req.body.latitude);
      if (!Number.isFinite(resolvedLng) || !Number.isFinite(resolvedLat)) {
        return res.status(400).json({ message: 'Valid location (lng, lat) is required.' });
      }
      updates.location = { lng: resolvedLng, lat: resolvedLat };
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'No valid fields provided for update.' });
    }

    const place = await Place.findByIdAndUpdate(pid, updates, {
      new: true,
      runValidators: true,
    }).populate('creator', 'name');

    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    res.status(200).json({ place: toPublicPlace(place) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:pid', async (req, res, next) => {
  try {
    const { pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ message: 'Invalid place id.' });
    }

    const deleted = await Place.findByIdAndDelete(pid);
    if (!deleted) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    res.status(200).json({ message: 'Place deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;
