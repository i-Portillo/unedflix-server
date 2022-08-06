import User from "../models/user.js";
import Genre from "../models/genre.js";
import Media from "../models/media.js";
import MediaReview from "../models/mediaReview.js";
import MediaSrc from "../models/mediaSrc.js";
import ViewLog from "../models/viewLog.js";
import { decreaseAffinity, increaseAffinity } from "../suggestion_system/genreAffinity.js";
import e from "express";

export const getMedias = async (req, res) => {
  try {
    const medias = await Media.find();
    res.status(200).send(medias);
  } catch(err) {
    console.log(err);
  }
}

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    console.log('Getting user:', user.email);
    res.send(user);
  } catch(err) {
    console.log(err);
  }
}

export const getUserRole = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    console.log('Getting user role:', user.email);
    res.send(user.role);
  } catch(err) {
    console.log(err);
  }
}

export const getUserGenres = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id });
    const genres = [...user.genre_affinity].sort( (a,b) => {
      return b.value - a.value;
    })
    res.status(200).send(genres);
  } catch(err) {
    console.log(err);
  }
}

export const getUserList = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }, 'my_list');
    const sortedList = user.my_list.sort( (a,b) => {
      return new Date(b.added) - new Date(a.added);
    });
    const medias = await Promise.all( sortedList.map( async media => {
      const foundMedia = await Media.findOne({ _id: media.media }, 'title poster type');
      return foundMedia;
    }));
    res.status(200).send(medias);
  } catch(err) {
    console.log(err);
  }
}

export const getUserKeepWatching = async (req, res) => {
  try {
    const viewLogs = await ViewLog.find({ user: req.user.id, progress: { $lt: 100 } })
    .populate({
      path: 'media_src',
      populate: {
        path: 'media',
        model: 'Media',
        select: { 'title': 1, 'poster': 1, 'type': 1 }
      }
    })
    const medias = [...new Set(viewLogs.map( viewLog => viewLog.media_src.media ))];
    res.status(200).send(medias);
  } catch(err) {
    console.log(err);
  }
}

export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).send(users);
  } catch(err) {
    console.log(err);
  }
}

export const getQuery = async (req, res) => {
  // const query = req.params.query;
  console.log(req.query.searchQuery);
  const query = req.query.searchQuery;
  try {
    const medias = await Media.find({
      $or: [
        { 'title': { "$regex": query, "$options": "i" }},
        { 'cast': { "$regex": query, "$options": "i"}},
        { 'director': { "$regex": query, "$options": "i"}},
      ]
    })
    res.status(200).send(medias);
  } catch(err) {
    console.log(err);
  }
}

export const getGenres = async (req, res) => {
  try {
    const genres = await Genre.find();
    res.status(200).send(genres);
  } catch(err) {
    console.log(err);
  }
}

export const getReview = async (req, res) => {
  try {
    const mediaReview = await MediaReview.findOne({ user: req.user.id, media: req.query.media });
    if (mediaReview) {
      res.send({ found: true, feedback: mediaReview.feedback});
    } else {
      res.send({ found: false });
    }
  } catch(err) {
    console.log(err);
  }
}

export const putReview = async (req, res) => {
  try {
    const mediaReview = await MediaReview.findOne({ user: req.user.id, media: req.body.media });
    if (mediaReview) {
      console.log('Review already exists');
    } else {
      console.log('Adding review');
      const newReview = new MediaReview({
        feedback: req.body.feedback,
        user: req.user.id,
        media: req.body.media,
      })

      newReview.save( (err, review) => {
        if (err) { console.log(err) }
        console.log('Media Review saved.')
      })

      const user = await User.findOneAndUpdate({ _id: req.user.id }, { $push: { media_reviews: newReview._id }}).select('genre_affinity');
      const affinities = user.genre_affinity;
      const media = await Media.findOne({ _id: req.body.media }).populate('genres').select('genres');
      const genres = media.genres.map( genre => genre.name );
      if (newReview.feedback === true ) {
        increaseAffinity(genres, affinities);
      } else {
        decreaseAffinity(genres, affinities);
      }
      await User.updateOne({ _id: req.user.id }, { genre_affinity: affinities });
    }
    res.status(200).send({ message: 'Review added', data: mediaReview });
  } catch(err) {
    console.log(err);
  }
}

export const deleteReview = async (req, res) => {
  try {
    // console.log('tryng to delete:', req.body.media, 'by', req.user.id)
    const deletedReview = await MediaReview.findOneAndRemove({ user: req.user.id, media: req.query.media });
    const user = await User.findOne({ _id: req.user.id }).select('genre_affinity');
    const affinities = user.genre_affinity;
    const media = await Media.findOne({ _id: req.query.media }).populate('genres').select('genres');
    const genres = media.genres.map( genre => genre.name );
    if (deletedReview.feedback === true ) {
      decreaseAffinity(genres, affinities);
    } else {
      increaseAffinity(genres, affinities);
    }
    await User.updateOne({ _id: req.user.id }, { genre_affinity: affinities, $pull: { media_reviews: deletedReview._id }});
    res.status(200).send({ message: 'Review deleted', data: deletedReview });
  } catch(err) {
    console.log(err);
  }
}

export const getMediaSrc = async (req, res) => {
  try {
    const mediaSrc = await MediaSrc.findOne({ _id: req.params.id });
    res.send(mediaSrc);
  } catch(err) {
    console.log(err);
  }
}

export const getMediaSrcsAndProgress = async (req, res) => {
  try {
    const media = await Media.findOne({ _id: req.params.id }, 'media_src')
    .populate({
      path: 'media_src',
      model: 'MediaSrc',
    });
    const mediaSrcs = media.media_src;
    const seasonsProgress = []
    for(const season of mediaSrcs) {
      const episodeProgressList = await Promise.all(season.map( async episode => {
        const viewLog = await ViewLog.findOne({ media_src: episode._id, user: req.user.id });
        if (viewLog) return viewLog.progress;
        return 0;
      }))
      seasonsProgress.push(episodeProgressList);
    }
    const response = { mediaSrcs, seasonsProgress };
    res.status(200).send(response);
  } catch(err) {
    console.log(err);
  }
}

export const getMediaInList = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    .select('my_list'); 
    if (user.my_list.filter( item => item.media.equals(req.params.id) ).length >= 1 ) {
      res.status(200).send(true);
    } else {
      res.status(200).send(false);
    }
  } catch(err) {
    console.log(err);
  }
}

export const putMediaInList = async (req, res) => {
  try {
    await User.findOneAndUpdate(
      { _id: req.user.id },
      { $addToSet: { 
        my_list: {
          media: req.params.id,
          added: Date.now(),
        }
      }}
    );
    res.status(204).send();
  } catch(err) {
    console.log(err);
  }
}

export const deleteMediaFromList = async (req, res) => {
  console.log('trying to delete')
  try {
    await User.updateOne({ _id: req.user.id }, {
      $pull: {
        my_list: { media: req.params.id }
      }
    })
    res.status(204).send();
  } catch(err) {
    console.log(err);
  }
}

export const getViewLog = async (req, res) => {
  const viewLog = await ViewLog.findOne({ user: req.user.id, media_src: req.query.mediaSrc });
  if (viewLog) {
    res.status(200).send({ message: 'viewLog found', data: viewLog, found: true });
  } else {
    res.status(204).send({ message: 'viewLog not found', found: false });
  }
}

export const putViewLog = async (req, res) => {
  try {
    const existentViewLog = await ViewLog.findOne({ user: req.user.id, media_src: req.body.mediaSrc });
    if (existentViewLog) {  // Already exists, then update
      existentViewLog.progress = req.body.progress;
      existentViewLog.date = Date.now();
      existentViewLog.save( (err, viewLog) => {
        if (err) res.send({ message: `ViewLog not saved: ${err}`, data: err});
        res.send({ message: 'ViewLog updated.', data: viewLog });
      });
    } else {
      const newViewLog = new ViewLog({
        user: req.user.id,
        media_src: req.body.mediaSrc,
        date: Date.now(),
        progress: req.body.progress,
      });
      newViewLog.save( (err, viewLog) => {
        if (err) res.send({ message: `ViewLog not saved: ${err}`, data: err});
        console.log('ViewLog created.')
        res.send({ message: 'ViewLog created.', data: viewLog });
      });
      await User.findOneAndUpdate({ _id: req.user.id }, { $push: { view_logs: newViewLog._id }})
    }
  } catch(err) {
    console.log(err);
  }
}