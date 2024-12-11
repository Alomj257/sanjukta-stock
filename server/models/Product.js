const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      unique: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
   
    stocks: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Stock", 
        },
        qty: {
          type: Number,
          min: 0, 
        },
        unit:String
      },
    ],
  },
  { timeStamp: true }
);

module.exports = mongoose.model("Product", productSchema);
