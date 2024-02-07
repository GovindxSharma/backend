const Order=require('../models/orderModels')
const Product=require('../models/productModels')
const ErrorHandler=require('../utils/errorhandler')

//create new order
exports.newOrder = async (req, res, next) => {
  try {
    console.log('Received data:', req.body);

    const { shippingInfo, orderItems, paymentInfo, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
    console.log(req.body)

    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paidAt: Date.now(),
      user: req.user._id,
    });

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};


exports.getSingleOrder=async(req,res,next)=>{
  const order =await Order.findById(req.params.id).populate("user","name email")

  if(!order){
    return next(new ErrorHandler("Order not found with this id",404))
  }
  res.status(200).json({status:true,order})
}


exports.myOrders=async(req,res,next)=>{
  const orders =await Order.find({user:req.user._id})

 
  res.status(200).json({status:true,orders})
}

//Admin
exports.getAllOrders=async(req,res,next)=>{
  const orders =await Order.find()

let totalAmount=0;

orders.forEach(order=>{
  totalAmount+=order.totalPrice
})
 
  res.status(200).json({status:true,totalAmount,orders})
}



async function updateStock(id, quantity) {
  const product = await Product.findById(id);
  product.Stock -= quantity;
  console.log(product.Stock,quantity,id,'--------------------oK')
  await product.save({ validateBeforeSave: false });
}
// update order status-admin
exports.updateOrder = async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("Order not found with this Id", 404));
  }

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  if (req.body.status === "Shipped") {
    order.orderItems.forEach(async (o) => {
      await updateStock(o.product, o.quantity);
    });
  }
  order.orderStatus = req.body.status;

  if (req.body.status === "Delivered") {
    order.deliveredAt = Date.now();
  }

  await order.save({ validateBeforeSave: false });
  res.status(200).json({
    success: true,
  });
}







exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHandler("Order not found with this id", 404));
    }

    await order.deleteOne(); // Use deleteOne method

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error('Error deleting order:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
    });
  }
};






