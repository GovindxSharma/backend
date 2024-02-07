const Product = require("../models/productModels");
const ApiFeatures = require("../utils/apifeature");
const ErrorHandler = require("../utils/errorhandler");
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier'); // You may need to install this module

// Create Product---Admin
exports.createProduct = async (req, res, next) => {
  try {
    let images = [];

    if (typeof req.body.images === "string") {
      images.push(req.body.images);
    } else {
      images = req.body.images;
    }

    const imagesLinks = [];

    for (let i = 0; i < images.length; i++) {
      // Create a readable stream from the file
      const fileStream = streamifier.createReadStream(images[i]);

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );

        // Pipe the file stream to Cloudinary
        fileStream.pipe(uploadStream);
      });

      imagesLinks.push({
        public_id: result.public_id,
        url: result.secure_url,
      });
    }

    req.body.images = imagesLinks;
    req.body.user = req.user.id;

    const product = await Product.create(req.body);

    res.status(201).json({
      success: true,
      product,
    });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};





// Get all products
module.exports.getAllProducts = async (req, res, next) => {
  try {
    const resultPerPage = 8;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resultPerPage);

    let products = await apiFeature.query;

    
      // console.log("Filter is used, count of matching products:", products.length);
   
   const filteredProductsCount=products.length

    res.status(200).json({ success: true, products, productCount, resultPerPage,filteredProductsCount });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};


//GET ALL PRODUCTS -ADMIN
module.exports.getAdminProducts = async (req, res, next) => {
  try {
   
    const products= await Product.find()

    res.status(200).json({ success: true, products });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};

exports.updateProduct = async (req, res, next) => {
  try {
    let product = await Product.findById(req.params.id);

    if (!product) {
      return next(new ErrorHandler('Product not found', 404));
    }
    console.log(req.body)
    // Check if req.body contains images, and remove them
    // if ('images' in req.body) {
    //   delete req.body.images;
    // }

    // Update the product in the database
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    // Send the updated product as the response
    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    console.error('Error in updateProduct:', error);
    next(error); // Pass the error to the next middleware
  }
};



// Delete Product
module.exports.deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }

    await Product.deleteOne({ _id: req.params.id });
    res
      .status(200)
      .json({ success: true, message: "Product Deleted Successfully" });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};

// Get single product details
module.exports.getSingleProductDetails = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next(new ErrorHandler("Product Not Found", 404));
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(new ErrorHandler(error.message, 500));
  }
};

//review
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

exports.createProductReview = async (req, res, next) => {
  const { rating, comment, productId } = req.body;
  console.log(productId,rating,comment)

  try {
    if (!productId || !ObjectId.isValid(productId)) {
      console.error("Invalid product ID in the request body");
      return res.status(400).json({
        success: false,
        error: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      console.error(`Product not found for ID: ${productId}`);
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    };

    const isReview = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());

    if (isReview) {
      product.reviews.forEach(rev => {
        if (rev.user.toString() === req.user._id.toString()) {
          rev.rating = rating;
          rev.comment = comment;
        }
      });
    } else {
      product.reviews.push(review);
      product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.ratings = product.reviews.reduce((acc, rev) => {
      avg += rev.rating;
      return acc + rev.rating;
    }, 0) / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
    });

  } catch (error) {
    console.error(`Error creating product review: ${error.message}`);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
    });
  }
};


exports.getProductReviews=async(req,res,next)=>{
  const product=await Product.findById(req.query.id);
  if(!product){
    return next(new ErrorHandler("Product not Found",404))
  }
  res.status(200).json({success:true,reviews:product.reviews})
}


exports.deleteReview = async (req, res, next) => {
  try {
    const product = await Product.findById(req.query.productId);
    if (!product) {
      return next(new ErrorHandler("Product not Found", 404));
    }

    const reviews = product.reviews.filter(rev => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    if (reviews.length > 0) {
      reviews.forEach(rev => {
        avg += rev.rating;
      });
    }

    const ratings = reviews.length > 0 ? avg / reviews.length : 0;

    const numOfReviews = reviews.length;

    // Use Product model to update
    await Product.findByIdAndUpdate(req.query.productId, {
      reviews,
      ratings,
      numOfReviews
    }, {
      new: true,
      runValidators: true,
      useFindAndModify: false
    });

    res.status(200).json({ success: true });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
