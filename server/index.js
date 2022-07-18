import express from 'express'
import multer from 'multer'
import mongoose from "mongoose"
import cors from 'cors'

import { loginValidation, postCreateValidation, registerValidation } from "./validations.js"
import { checkAuth, handleValidationsErrors } from "./utils/index.js";
import { PostController, UserController } from './controllers/index.js'
import { MONGO_CONNECTION } from "./db.js";

// db connect
mongoose
  .connect(MONGO_CONNECTION)
  .then(() => console.log('DB Connected'))
  .catch((err) => console.log('DB Error -> ', err))

// create server
const app = express()

// storage for images
const storage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, 'uploads')
  },
  filename: (_, file, cb) => {
    cb(null, file.originalname)
  }
})

const upload = multer({storage})

// json user in express
app.use(express.json())
// use cors
app.use(cors())
// uploads in express
app.use('/uploads', express.static('uploads'))

// api example
app.get('/', (req, res) => {
  res.send('Hello world')
})

// login
app.post('/auth/login', loginValidation, handleValidationsErrors, UserController.login)
// register
app.post('/auth/register', registerValidation, handleValidationsErrors, UserController.register)
// check auth
app.get('/auth/me', checkAuth, UserController.getMe)

// get all posts
app.get('/posts', PostController.getAll)
// get one post
app.get('/posts/:id', PostController.getOne)
// create post
app.post('/posts', checkAuth, postCreateValidation, handleValidationsErrors, PostController.create)
// delete post
app.delete('/posts/:id', checkAuth, PostController.remove)
// update post
app.patch('/posts/:id', checkAuth, handleValidationsErrors, PostController.update)

// get tags
app.get('/tags', PostController.getLastTags)

// upload image
app.post('/upload', upload.single('image'), (req, res) => {
  res.json({
    url: `/uploads/${req.file.originalname}`
  })
})

// start server
app.listen(4444, (err) => {
  if (err) return console.log(err)

  console.log('Server OK')
})