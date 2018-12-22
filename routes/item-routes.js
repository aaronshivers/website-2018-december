const express = require('express')
const router = express.Router()
const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const Inventory = require('../models/item-model')
const authenticateUser = require('../middleware/authenticate-user')

// GET /
router.get('/', (req, res) => res.render('index'))

// GET /items
router.get('/items', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id

    Inventory.find({owner}).then((items) => {
      res.render('items', { items })
    }).catch(err => res.sendStatus(400))
  })
})

// POST /items
router.post('/items', authenticateUser, (req, res) => {
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    const name = new Inventory({name: req.body.name, owner: owner })

    name.save().then((item) => {
      res.send({ item })
    }).catch(err => res.sendStatus(400))
  })


})

// GET /items/:id
router.get('/items/:id', authenticateUser, (req, res) => {
  const _id = req.params.id
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (!ObjectId.isValid(_id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    const conditions = {_id, owner}

    Inventory.findOne(conditions).then((item) => {
      if (!item) {
        res.status(404).send('Item Not Found')
      }
      res.send({ item })
    }).catch(err => res.status(400).send())
  })
})

// DELETE /items/:id
router.delete('/items/:id', authenticateUser, (req, res) => {
  const _id = req.params.id
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (!ObjectId.isValid(_id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    const conditions = {_id, owner}
    Inventory.findOneAndDelete(conditions).then((item) => {
      if (!item) {
        res.status(404).send('Item Not Found')
      }
      res.send({ item })
    }).catch(err => res.status(400).send())
  })
})

// PATCH /items/:id
router.patch('/items/:id', authenticateUser, (req, res) => {
  const _id = req.params.id
  const token = req.cookies.token
  const secret = process.env.JWT_SECRET

  if (!ObjectId.isValid(_id)) {
    return res.status(404).send('Invalid ObjectId')
  }

  jwt.verify(token, secret, (err, decoded) => {
    const owner = decoded._id
    if (!owner) {
      res.sendStatus(404)
    }

    const conditions = {_id, owner}
    const update = { name: req.body.name }
    const options = { new: true }

    Inventory.findOneAndUpdate(conditions, update, options).then((item) => {
      if (!item) {
        res.status(404).send('Item Not Found')
      } else {
        res.send({ item })
      }
    }).catch(err => res.send(err.message))
  })
})

module.exports = router