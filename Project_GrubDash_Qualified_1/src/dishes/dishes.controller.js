const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function list(req, res) {
  res.json({data: dishes})
}

function create(req, res) {
  
  const newId = nextId()
  const newName = req.body.data.name
  const newDesc = req.body.data.description
  const newPrice = req.body.data.price
  const newImgUrl = req.body.data.image_url
  
  const{ 
    data: { id, name, description, price, image_url }   //,//
  } = req.body
  
  const newDish = {
    id: nextId(),
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url
  }
  
  dishes.push(newDish)
  res.status(201).json({data: newDish})
  
 }

function read(req, res, next) {
  const dishFound = res.locals.dish
  if (dishFound) {
    res.json({data: dishFound[0]})
  }
}

function update(req, res) {
  dishId = req.params.dishId
  let {
    data: {name, description, price, image_url}
  } = req.body
  let updatedDish = {
    id: dishId,
    name: req.body.data.name,
    description: req.body.data.description,
    price: req.body.data.price,
    image_url: req.body.data.image_url
  }
  return res.json({data: updatedDish})
}

function dishExists(req,res,next) {
  const dishId = req.params.dishId
  const dishFound = dishes.filter((dish) => dish.id === dishId)
  if (dishFound.length > 0) {
    res.locals.dish = dishFound
    next()
  }
  else{
    next({status: 404, message: `Dish ${dishId} not found.`})
  }
}

function isIdValid(req,res,next) {
  let {data: { id }} = req.body
  const dishId = req.params.dishId
  const reqId = req.body.data.id
  if (reqId === null || reqId === undefined || reqId === "") {
    return next()
  }
  if (reqId !== dishId) {
    next({status: 400, message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`})
  } 
  else {
    next()
  }
}

function isNameValid(req,res,next) {
  const {data: name} = req.body
  const reqName = req.body.data.name
  if (reqName === null || reqName === undefined || reqName === "") {
    next({status: 400, message: 'Dish must include a name.'})
  }
  next()
}

function isDescValid(req,res,next) {
  const {data: description} = req.body
  const reqDesc = req.body.data.description
  if (reqDesc === null || reqDesc === undefined || reqDesc === "") {
    next({status: 400, message: 'Dish must include a description.'})
  }
  next()
}

function isPriceValid(req,res,next) {
  const {data: price} = req.body
  const reqPrice = req.body.data.price
  if (reqPrice === null || reqPrice === undefined || reqPrice === '') {
    next({status: 400, message: 'Dish must include a price.'})
  }
  if (typeof reqPrice === 'number' && reqPrice > 0){
    return next()
  }
  else {
    next({status: 400, message: 'The price must be a number greater than 0'})
  }
}

function isUrlValid(req,res,next) {
  const {data: image_url} = req.body
  const reqImg = req.body.data.image_url
  if (reqImg === null || reqImg === undefined || reqImg === "") {
    next({status: 400, message: 'Dish must include a image_url.'})
  }
  next()
}


module.exports = {
  list,
  create: [isNameValid, isDescValid, isPriceValid, isUrlValid, create],
  read: [dishExists, read],
  update: [dishExists, isNameValid, isDescValid, isPriceValid, isUrlValid, isIdValid, update]
}