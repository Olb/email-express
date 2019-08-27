const express = require('express')
const path = require('path')
const multer = require('multer')
const requireAuth = require('../lib/require-auth')
const bodyParser = require('body-parser')
let generatedId = require('../lib/generate-id')
const enforce = require('../lib/enforce')
const emails = require('../fixtures/emails')

let upload = multer({ dest: path.join(__dirname, '../uploads') })

class NotFound extends Error {
  constructor(message) {
    super(message)
    this.name = 'NotFound'
  }
}

let getEmailRoute = (req, res) => {
  let email = emails.find(email => email.id === req.params.id)
  if (!email) {
    res.sendStatus(404)
  }
  res.send(email)
}

let getEmailsRoute = (req, res) => {
  res.send(emails)
}

let createEmailRoute = async (req, res) => {
  let attachments = (req.files || []).map(file => '/uploads/' + file.filename)
  let newEmail = { ...req.body, id: generatedId(), attachments }
  emails.push(newEmail)
  res.status(201)
  res.send(newEmail)
}

let updateEmailRoute = async (req, res) => {
  let email = emails.find(email => email.id === req.params.id)
  req.authorize(email)
  Object.assign(email, req.body)
  res.status(200)
  res.send(email)
}

let deleteEmailRoute = (req, res) => {
  let email = emails.find(email => email.id === req.params.id)
  req.authorize(email)
  let index = emails.findIndex(email => email.id === req.params.id)
  emails.splice(index, 1)
  res.sendStatus(204)
}

let deleteEmailPolicy = (user, email) => user.id === email.from

let updateEmailPolicy = (user, email) => user.id === email.to

let emailsRouter = express.Router()

emailsRouter.use(requireAuth)

emailsRouter
  .route('/')
  .get(getEmailsRoute)
  .post(bodyParser.json(), upload.array('attachments'), createEmailRoute)

emailsRouter
  .route('/:id')
  .get(getEmailRoute)
  .patch(enforce(updateEmailPolicy), bodyParser.json(), updateEmailRoute)
  .delete(enforce(deleteEmailPolicy), deleteEmailRoute)

module.exports = emailsRouter
