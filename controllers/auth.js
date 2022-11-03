import passport from 'passport';

export const signin = (req, res) => {
  passport.authenticate("local", (err, user, info) => {
    console.log('start authenticate')
    if (err) { console.log(err) };
    if (!user) return res.status(401).json({ message: "Invalid credentials."});
    else {
      req.logIn(user, (err) => {
        if (err) { console.log(err) };
        res.status(200).json({ message: "User authenticated", data: user });
      })
    }
    console.log('end authenticate')
  })(req, res);
}

export const signout = (req, res) => {
  console.log('loggin out')
  req.logout( (err) => {
    if (err) { console.log(err) };
    req.session.destroy();
  });
}

export const loggedIn = (req, res, next) => {
  console.log('test')
  if (req.isAuthenticated()) {
    console.log('Authenticated')
    res.auth = true;
    return next();
  } else {
    console.log('Not authenticated');
    res.auth = false;
    res.status(401);
    res.send('Not authorized in loggedIn()')
  }
}

export const allowThrough = (req, res, next) => {
  res.status(200).send({ message: 'User authenticated', user: req.user });
}