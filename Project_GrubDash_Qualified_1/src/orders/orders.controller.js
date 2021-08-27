const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");
// TODO: Implement the /orders handlers needed to make the tests pass
function list(req,res) {
  res.json({data: orders})
}

function create(req,res) {
  const newOrder = {...res.locals.order, id: nextId()}
  orders.push(newOrder)
  res.status(201).json({data: newOrder})
 }

function read(req,res,next) {
  const orderFound = res.locals.order
  if (orderFound) {
    res.json({data: orderFound[0]})
  }
}

function update(req,res) {
  const orderId = req.params.orderId
  const {data: id, deliverTo, mobileNumber, status, dishes} = req.body
  let updatedOrder = {
    id: orderId,
    deliverTo: req.body.data.deliverTo,
    mobileNumber: req.body.data.mobileNumber,
    status: req.body.data.status,
    dishes: req.body.data.dishes
  }
  return res.json({data: updatedOrder})
}

function destroy(req,res,next) {
  const orderId = req.params.orderId
  const orderFound = res.locals.order
  const index = orders.find((order) => order.id === Number(orderId))
  const deleted = orders.splice(index, 1)
  if (orderFound[0].status === 'pending') {
    res.sendStatus(204)
  }
  next({status: 400, message: 'An order cannot be deleted unless it is pending'})
}

function orderExists(req,res,next) {
  const orderId = req.params.orderId
  const orderFound = orders.filter((order) => order.id === orderId)
  if (orderFound.length > 0) {
    res.locals.order = orderFound
    next()
  }
  else {
    next({status: 404, message: `Order ${orderId} not found.`})
  }
}

function isIdValid(req,res,next) {
  let {data: {id},} = req.body
  const orderId = req.params.orderId
  const reqId = req.body.data.id
  if (reqId === null || reqId === undefined || reqId === '') {
    return next()
  }
  if (reqId !== orderId) {
    next({status: 400, message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`})
  }
  else {
    next()
  }
}

function isStatusValid(req,res,next) {
  const {data: {status} = {}} = req.body
  try {
    if (status !== ('pending' || 'preparing' || 'out-for-delivering' || 'delivered')) {
      next({status: 400, message: 'Order must have a status of pending, preparing, out-for-delivery, or delivered'})
    }
    if (status === 'delivered') {
      return next({status: 400, message: 'A delivered order cannot be changed'})
    }
    next()
  }
  catch(error) {
    console.log('ERROR =', error)
  }
}

function isCreateValid(req,res,next) {
  const {dishes, deliverTo, mobileNumber} = req.body.data
  if (!dishes) {
    next({status: 400, message: 'Order must include a dish'})
  }
  if (!deliverTo) {
    next({status: 400, message: 'Order must include a deliverTo'})
  }
  if (!mobileNumber) {
    next({status: 400, message: 'Order must include a mobileNumber'})
  }
  if (!dishes.length > 0 || !Array.isArray(dishes)) {
    return next({status: 400, message: 'Dishes must include at least one dish'})
  }
  dishes.map((dish, index) => {
    if (!dish.quantity || !dish.quantity > 0 || !Number.isInteger(dish.quantity)) {
      return next({status: 400, message: `Dish ${index} must have a quantity that is an integer greater than 0`})
    }
  })
  res.locals.order = req.body.data
  next()
}

module.exports = {
  create: [isCreateValid, create],
  read: [orderExists, read],
  update: [orderExists, isCreateValid, isIdValid, isStatusValid, update],
  destroy: [orderExists, destroy],
  list
}