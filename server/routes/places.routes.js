import express from 'express';
import mongoose from 'mongoose';
import Place from '../models/place.model.js';
import { requireAuth } from '../middlewares/auth.js';

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

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const {
      title,
      description,
      address,
      imageUrl,
      people,
      location,
      lat,
      lng,
      longitude,
      latitude,
    } = req.body;

    if (!title?.trim() || !description?.trim() || !address?.trim() || !imageUrl?.trim()) {
      return res.status(400).json({
        message: 'title, description, address and imageUrl are required.',
      });
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
      creator: req.authUser.id,
      location: { lng: resolvedLng, lat: resolvedLat },
      people: Number.isFinite(Number(people)) ? Number(people) : 0,
    });

    const hydrated = await place.populate('creator', 'name');
    res.status(201).json({ place: toPublicPlace(hydrated) });
  } catch (error) {
    next(error);
  }
});

router.patch('/:pid', requireAuth, async (req, res, next) => {
  try {
    const { pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ message: 'Invalid place id.' });
    }

    const existingPlace = await Place.findById(pid);
    if (!existingPlace) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    if (existingPlace.creator.toString() !== req.authUser.id) {
      return res.status(403).json({ message: 'This place does not belong to you.' });
    }

    const updates = {};
    const updatableFields = ['title', 'description', 'address', 'imageUrl'];

    for (const field of updatableFields) {
      if (typeof req.body[field] === 'string') {
        updates[field] = req.body[field].trim();
      }
    }

    if (req.body.people !== undefined) {
      const parsedPeople = Number(req.body.people);
      if (!Number.isFinite(parsedPeople)) {
        return res.status(400).json({ message: 'people must be a valid number.' });
      }
      updates.people = parsedPeople;
    }

    const hasLocation =
      req.body.location || req.body.lng || req.body.lat || req.body.longitude || req.body.latitude;

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

    res.status(200).json({ place: toPublicPlace(place) });
  } catch (error) {
    next(error);
  }
});

router.delete('/:pid', requireAuth, async (req, res, next) => {
  try {
    const { pid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(pid)) {
      return res.status(400).json({ message: 'Invalid place id.' });
    }

    const place = await Place.findById(pid);
    if (!place) {
      return res.status(404).json({ message: 'Place not found.' });
    }

    if (place.creator.toString() !== req.authUser.id) {
      return res.status(403).json({ message: 'This place does not belong to you.' });
    }

    await Place.findByIdAndDelete(pid);
    res.status(200).json({ message: 'Place deleted successfully.' });
  } catch (error) {
    next(error);
  }
});

export default router;