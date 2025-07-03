const passport = require('passport');

// Step 1: Start OAuth
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Step 2: Callback from Google
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('http://localhost:5173/dashboard'); // redirect to your frontend dashboard
  }
);

// Step 3: Check session
router.get('/me', (req, res) => {
  if (req.user) {
    res.json(req.user);
  } else {
    res.status(401).json({ message: 'Not logged in' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.logout(() => {
    res.clearCookie('token');
    res.redirect('http://localhost:5173/login');
  });
});
