import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import UserModel from "../models/User.js";

export const register = async (req, res) => {
  try {
    // password hash
    const password = req.body.password
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    // create user
    const doc = new UserModel({
      email: req.body.email,
      fullName: req.body.fullName,
      avatarUrl: req.body.avatarUrl,
      passwordHash: hash,
    })

    // save user in db
    const user = await doc.save()

    // create jwt
    const token = jwt.sign({
        _id: user._id
      },
      'secret123',
      {
        expiresIn: '30d'
      })

    // delete passwordHash from user
    const {passwordHash, ...userData} = user._doc

    res.json({
      ...userData,
      token
    })
  } catch (err) {
    console.log('====>err<====', err)
    res.status(500).json({
      message: 'Не удалось зарегистрироваться'
    })
  }
}

export const login = async(req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email })

    if (!user) {
      return res.status(404).json({
        message: 'Пользователь не найден'
      })
    }

    const isValidPass = await bcrypt.compare(req.body.password, user._doc.passwordHash)

    if (!isValidPass) {
      return res.status(404).json({
        message: 'Неверный логин или пароль'
      })
    }

    // create token
    const token = jwt.sign({
        _id: user._id
      },
      'secret123',
      {
        expiresIn: '30d'
      })

    // delete passwordHash from user
    const {passwordHash, ...userData} = user._doc

    res.json({
      ...userData,
      token
    })
  } catch (err) {
    console.log('====>err<====', err)
    res.status(500).json({
      message: 'Не удалось авторизоваться'
    })
  }
}

export const getMe = async(req, res) => {
  try {
    const user = await UserModel.findById(req.userId)

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      })
    }

    // delete passwordHash from user
    const {passwordHash, ...userData} = user._doc

    res.json(userData)
  } catch (err) {
    console.log('====>err<====', err)
    res.status(500).json({
      message: 'Ошибка доступа'
    })
  }
}