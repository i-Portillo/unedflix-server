import passport from 'passport';

export const signin = (req, res) => {
  passport.authenticate("local", (err, user, info) => {
    console.log('start authenticate')
    if (err) { console.log(err) };
    if (!user) return res.status(404).json({ message: "User doesn't exist."});
    else {
      req.logIn(user, (err) => {
        if (err) { console.log(err) };
        res.status(200).json({ message: "User authenticated" });
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
