const { render } = require('ejs');
const express = require('express');
const fs = require('fs');
const router = express.Router();
const bcrypt = require('bcrypt');
const passport = require('passport');
const flash = require('express-flash');
const session = require('express-session');

const initializePassport = require('../passport-config');
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
);


const plants = require('../model/plants');
const posts = require('../model/posts');

const users = [];
function checkAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return next()
  }

  res.redirect('login')
}
function notAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
      return res.redirect('/')
  }

  next()
}

router.get('/', checkAuthenticated, async function(req,res){
  var plant = await plants.find();
  
  res.render('index', {plant});
  });

router.get('/monitor', checkAuthenticated, async function(req,res){
  var post = await posts.find();
  var plant = await plants.find();

  res.render('monitor', {post, plant});
});

router.get('/postSim', checkAuthenticated, async (req,res) =>{
  res.render('postSim',{title: 'newPost'});
});

router.post('/postSim', checkAuthenticated, async (req,res) =>{
  console.log(req.body);
  var post = new posts(req.body);
  await post.save();
  res.redirect("/");
});

router.get('/newPlant', checkAuthenticated, async (req,res) =>{
  res.render('newPlant',{title: 'newPlant'});
});

router.post('/newPlant', checkAuthenticated, async (req,res) =>{
 
  console.log(req.body);
  var plant = new plants(req.body);
  await plant.save();
  res.redirect("/");

});

router.get('/help', checkAuthenticated, (req,res) =>{
  res.render('help');
});

router.post('/help', checkAuthenticated, async (req,res) =>{
  res.redirect("/");
});

router.get('/info', checkAuthenticated, (req,res) =>{
  res.render('info');
});

router.get('/edit/:id', checkAuthenticated, async(req,res) => {
  var plant = await plants.findById(req.params.id);
  res.render('edit', {plant});
});

router.post('/edit/:id', checkAuthenticated, async(req,res) => {
  var id = req.params.id;
  await plants.update({_id: id}, req.body);
  res.redirect("/");
});

router.get('/delete/:id', checkAuthenticated, async(req,res) => {
    var plant = await plants.findById(req.params.id);
    res.render('delete', {plant});
  });
  
router.post('/delete/:id', checkAuthenticated, async(req,res) => {
  var id = req.params.id;
  await plants.deleteOne({_id:id})
  res.redirect("/");
});

router.get('/view/:id', checkAuthenticated, async(req,res) => {
  var plant = await plants.findById(req.params.id);
  res.render('view', {plant});
});

router.get('/video', checkAuthenticated, function(req, res) {
  const path = 'public/assets/1.mp4'
  const stat = fs.statSync(path)
  const fileSize = stat.size
  const range = req.headers.range

  if (range) {
    const parts = range.replace(/bytes=/, "").split("-")
    const start = parseInt(parts[0], 10)
    const end = parts[1]
      ? parseInt(parts[1], 10)
      : fileSize-1

    if(start >= fileSize) {
      res.status(416).send('Requested range not satisfiable\n'+start+' >= '+fileSize);
      return
    }
    
    const chunksize = (end-start)+1
    const file = fs.createReadStream(path, {start, end})
    const head = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': chunksize,
      'Content-Type': 'video/mp4',
    }

    res.writeHead(206, head)
    file.pipe(res)
  } else {
    const head = {
      'Content-Length': fileSize,
      'Content-Type': 'video/mp4',
    }
    res.writeHead(200, head)
    fs.createReadStream(path).pipe(res)
  }
});

router.get('/login', notAuthenticated, (reg, res) => {
  res.render('login.ejs')
});

router.post('/login', notAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}));

router.get('/register', notAuthenticated, (req, res) => {
  res.render('register.ejs')
});

router.post('/register', notAuthenticated, async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    users.push({
      id: Date.now().toString(),
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword
    })
    res.redirect('/login')
  } catch {
    res.redirect('/register')
  }
  console.log(users)
});

module.exports = router;
