import bcrypt from 'bcryptjs';
import { exec, execSync } from 'child_process';

import User from "../models/user.js";
import Genre from "../models/genre.js";
import Media from "../models/media.js";
import MediaReview from "../models/mediaReview.js";
import MediaSrc from "../models/mediaSrc.js";
import ViewLog from "../models/viewLog.js";
import { decreaseAffinity, increaseAffinity } from "../suggestion_system/genreAffinity.js";

export const getMedias = async (req, res) => {
  try {
    const medias = await Media.find()
    .populate('genres')
    .populate({
      path: 'media_src',
      model: 'MediaSrc',
    });
    res.status(200).send(medias);
  } catch(err) {
    console.log(err);
  }
}

export const putMediaData = async (req, res) => {
  try {

    const updatedMediaSrc = await Promise.all( req.body.data.media_src.map( async season => {
      const episodes = await Promise.all( season.map( async episode => {
        if (episode._id) {
          let episodeSrc = await MediaSrc.findOneAndUpdate({ _id: episode._id }, { title: episode.title, src: episode.src });
          return episodeSrc;
        } else {
          const newEpisode = new MediaSrc({
            media: req.body.mediaId,
            title: episode.title,
            src: episode.src
          })
          const savedEpisode = await newEpisode.save();
          return savedEpisode;
        }
      }))
      return episodes;
    }))

    const updatedMedia = await Media.findOneAndUpdate({ _id: req.body.mediaId }, { ...req.body.data, media_src: updatedMediaSrc, genres: req.body.data.genres.map(genre => genre._id) });

    res.status(200).send(updatedMedia);
  } catch(err) {
    console.log(err);
  }
}

export const postMedia = async (req, res) => {
  try {
    const mediaData = req.body.data;
    
    const newMedia = new Media({
      media_id: mediaData.media_id,
      title: mediaData.title,
      genres: mediaData.genres,
      overview: mediaData.overview,
      type: mediaData.type,
      release_date: mediaData.release_date,
      cast: mediaData.cast,
      director: mediaData.director,
      production: mediaData.production,
      poster: mediaData.poster,
      updated: mediaData.updated,
    })

    const mediaSrcs = await Promise.all(mediaData.media_src.map( async season => {
      const episodes = await Promise.all(season.map( async episode => {
        const newSrc = new MediaSrc({
          title: episode.title,
          src: episode.src,
          media: newMedia._id,
        })

        const savedSrc = await newSrc.save();
        console.log('savedSrc', savedSrc);
        return savedSrc;
      }))
      return episodes;
    }))

    console.log('mediaSrcs:', mediaSrcs);

    newMedia.media_src = mediaSrcs;

    await newMedia.save();

    res.status(200).send(req.body.data);
  } catch(err) {
    console.log(err);
  }
}

export const deleteMedia = async (req, res) => {
  try {
    const deletedMedia = await Media.findOneAndDelete({ _id: req.params.media });
    await User.updateMany({ 'my_list.media' : req.params.media }, { $pull: { 'my_list': { media: req.params.media} }}); // Remove from user lists
    const mediaReviews = await MediaReview.find({ media: deletedMedia._id });
    await Promise.all(mediaReviews.map( async review => { 
      return await User.findOneAndUpdate({ _id: review.user }, { $pull: { media_reviews: review._id }}); // Remove all references to reviews in users
    }))
    const deletedReviews = await MediaReview.deleteMany({ media: deletedMedia._id }); // Remove all reviews
    const mediaSrcs = await MediaSrc.find({ media: req.params.media });
    const deletedSrcs = await MediaSrc.deleteMany({ media: deletedMedia._id }); // Remove all srcs
    await Promise.all(mediaSrcs.map( async src => {
      const viewLogs = await ViewLog.find({ media_src: src._id });
      await Promise.all( viewLogs.map( async log => {
        return await User.findOneAndUpdate({ _id: log.user }, { $pull: { view_logs: log._id }});  // Remove all references to view logs in users
      }))
      await ViewLog.deleteMany({ media_src: src._id }); // Remove all view logs
    }))
    
    res.status(200).send({ deletedMedia, deletedReviews, deletedSrcs });
  } catch(err) {
    console.log(err);
  }
}

export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id })
    .populate({
      path: 'media_reviews',
      populate: {
        path: 'media',
        select: { title: 1 },
        model: 'Media',
      }
    })
    .populate({
      path: 'view_logs',
      populate: {
        path: 'media_src',
        select: { media: 1, title: 1 },
        model: 'MediaSrc',
        populate: {
          path: 'media',
          select: { title: 1, type: 1 },
          model: 'Media',
        }
      }
    });
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

export const getUserReviews = async (req, res) => {
  try {
    const reviews = await MediaReview.find({ user: req.params.user })
    .populate('media');
    res.status(200).send(reviews);
  } catch(err) {
    console.log(err);
  }
}

export const getUserViewLogs = async (req, res) => {
  try {
    const viewLogs = await ViewLog.find({ user: req.params.user })
    .populate('media_src');
    res.status(200).send(viewLogs);
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

export const getUserBankDetails = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.user.id }, 'bank_details');
    res.status(200).send(user.bank_details);
  } catch(err) {
    console.log(err);
  }
}

export const postUser = async (req, res) => {
  try {

    const existentUser = await User.findOne({ email: req.body.data.email });

    if (existentUser) {
      res.status(403).send({ message: 'User already exists.'});
    }

    const hashedPassword = await bcrypt.hash(req.body.data.password, 10);

    const genres = await Genre.find();

    const affinities = genres.map( genre => {
      return {
        genre: genre.name,
        value: 50
      };
    })

    const createdUser = new User({
      email: req.body.data.email,
      password: hashedPassword,
      role: req.body.data.role,
      name: req.body.data.name,
      family_name: req.body.data.family_name,
      address: req.body.data.address,
      city: req.body.data.city,
      state: req.body.data.state,
      zip_code: req.body.data.zip_code,
      bank_details: req.body.data.bank_details,
      subscription_status: req.body.data.subscription_status,
      genre_affinity: affinities,
      view_logs: [],
      media_reviews: [],
      my_list: [],
      last_payment: Date.now(),
    });    

    createdUser.save( (err) => {
      if (err) {
        console.log('error in user:', err)
        cb(err, null);
        return;
      }
    });

    res.status(200).send(createdUser);

  } catch(err) {
    console.log(err);
  }
}

export const putUserData = async (req, res) => {
  try {
    const user = req.body.user ? req.body.user : req.user.id;
    const updatedUser = await User.findOneAndUpdate({ _id: user }, req.body.data );
    res.status(200).send(updatedUser);
  } catch(err) {
    console.log(err);
  }
}

export const putUserPassword = async (req, res) => {
  try {
    const user = req.user.id;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const updatedUser = await User.findOneAndUpdate({ _id: user }, { password: hashedPassword });
    console.log(updatedUser);
    res.status(200).send(updatedUser);
  } catch(err) {
    console.log(err);
  }
}

export const deleteUser = async (req, res) => {
  try {
    const deletedUser = await User.findOneAndDelete({ _id: req.params.user });
    await ViewLog.deleteMany({ user: deletedUser._id });
    await MediaReview.deleteMany({ user: deletedUser._id });
    res.status(200).send(deletedUser);
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
    genres.sort( (a,b) => {
      if (a.name < b.name) return -1;
      return 1;
    });
    res.status(200).send(genres);
  } catch(err) {
    console.log(err);
  }
}

export const postGenre = async (req, res) => {
  try {
    const newGenre = await new Genre({ name: req.body.genre });
    await newGenre.save();
    await User.updateMany({}, { $push: { genre_affinity: { genre: req.body.genre, value: 50 } }});
    res.status(200).send(newGenre);
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

export const getMediaReviewData = async (req, res) => {
  try {
    const likedCount = await MediaReview.count({ media : req.params.mediaId, feedback: true });
    const dislikedCount = await MediaReview.count({ media : req.params.mediaId, feedback: false });
    res.status(200).send({ liked: likedCount, disliked: dislikedCount });
  } catch(err) {
    console.log(err);
  }
}
  
export const getListedData = async (req, res) => {
  try {
    const listedCount = await User.count({ 'my_list.media': req.params.mediaId })
    res.status(200).send({ count: listedCount });
  } catch(err) {
    console.log(err);
  }
}

export const postFile = async (req, res) => {
  try {
    const file = req.files.file;
    const path = `public${req.body.path}`;
    const fileName = req.body.fileName;
    await file.mv(`${path}${fileName}`);
    res.status(200).send({ message: 'File uploaded.'});
  } catch(err) {
    console.log(err);
  }
}

export const backupDB = async (req, res) => {
  try {
    const date = new Date();
    execSync(`mongodump --uri=${process.env.MONGODB} --archive=dump/unedflix_dump`, (error, stdout, stderr) => {
      if (error) {
          console.log(`error: ${error.message}`);
          return;
      }
      if (stderr) {
          console.log(`stderr: ${stderr}`);
          return;
      }
      console.log(`stdout: ${stdout}`);
    });
    res.status(200).sendFile('/dump/unedflix_dump', { root: '.' });

  } catch (err) {
    console.log(err);
  }
}

export const restoreDB = async (req, res) => {
  try {
    const file = req.files.file;
    const path = `dump${req.body.path}`;
    const fileName = req.body.fileName;
    await file.mv(`${path}${fileName}`);
    execSync(`mongo unedflix --eval 'db.dropDatabase()'`);
    execSync(`mongorestore --archive=./${path}${fileName}`);
    res.status(200).send({ message: 'DB restored.' });
  } catch(err) {
    console.log(err);
  }
}