import User from './models/user.js';
import bcrypt from 'bcryptjs';
import { Strategy } from 'passport-local';

export default (passport) => {
  passport.use(
    new Strategy((email, password, done) => {
      User.findOne({ email: email }, (err, user) => {
        if (err) { console.log(err) };
        if (!user) return done(null, false);
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) { console.log(err) };
          if (result === true) {
            return done(null, user);
          } else {
            return done(null, false);
          }
        });
      });
    })
  );

  passport.serializeUser( (user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser( (id, done) => {
    User.findOne({ _id: id }, (err, user) => {
      const userData = {
        id: user._id,
        email: user.email,
        role: user.role
      };
      done(err, userData);
    });
  });
};