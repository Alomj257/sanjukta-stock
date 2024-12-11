const { default: mongoose } = require("mongoose");
const Section = require("../models/Section");
const Stock = require("../models/Stock");
const StockJoining = require("../models/StockJoining");

// Add ExistingItem
exports.addSection = async (req, res, next) => {
  try {
    const section = new Section(req.body);
    await section.save();
    res.status(201).json({
      message: "section added successfully",
      section,
    });
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};

// Update Section
exports.updateSection = async (req, res, next) => {
  const {id}=req.params;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const section = await Section.findById(req.params?.id).session(session);
    if (!section) {
      throw new Error("Section not found");
    }
    const { stocks,date } = req.body;
    if (stocks && Array.isArray(stocks)) {
      for (const stock of stocks) {
        const { _id, qty } = stock;
        // Find the stock item
        const stockDoc = await Stock.findById(_id).session(session);
        if (!stockDoc) {
          throw new Error(`Stock with ID ${_id} not found.`);
        }

        // Check if the stock quantity is sufficient
        if (stockDoc.totalStock < qty) {
          throw new Error(
            `Insufficient stock Available: ${stockDoc.totalStock}, Requested: ${qty}`
          );
        }

        // Deduct stock quantity
        stockDoc.totalStock -= qty;
        await stockDoc.save({ session });
      }

      const stockJoining = await StockJoining.findOne({ sectionId: id });
      if (stockJoining) {
        stockJoining.stockGroup.push({ date: date, status: "assign" }); 
        await stockJoining.save({session});
      } else {
        const newStockJoining = new StockJoining({
          sectionId: id,
          stockGroup: [{ date: date, status: "assign" }],
        });
        await newStockJoining.save({session});
      }
      req.body.stocks=[...section.stocks,...req.body.stocks];
    }


    // Update the Section with the new data
    const updatedSection = await Section.findByIdAndUpdate(
      req.params?.id,
      req.body,
      { new: true, session }
    );

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: "Section updated successfully",
      section: updatedSection,
    });
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    session.endSession();

    console.error("Error updating section:", error.message);
    next(error);
  }
};

// Delete ExistingItem
exports.deleteSection = async (req, res, next) => {
  const { id } = req.params;
  try {
    const section = await Section.findById(id);
    if (!section) {
      throw new Error("Section not found");
    }
    // Delete the Section
    const updatedSection = await Section.findByIdAndDelete(id);

    res.status(200).json({
      message: " Section deleted successfully",
      section: updatedSection,
    });
  } catch (error) {
    console.error("Error deleting Section:", error.message);
    next(error);
  }
};

// Get all Sections
exports.getAllSection = async (req, res, next) => {
  try {
    const sections = await Section.find();
    res.status(200).json({
      message: "Sections fetched successfully",
      sections,
    });
  } catch (error) {
    next(error);
  }
};

// Get Section by ID with stock details and total price
exports.getSectionById = async (req, res, next) => {
  const { id } = req.params;
  try {
    const section = await Section.findOne({ _id: id });

    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      throw error;
    }

    res.status(200).json({
      message: "Section details fetched successfully",
      section,
    });
  } catch (error) {
    next(error);
  }
};

exports.getSectionByUserId = async (req, res, next) => {
  const { userId, status } = req.params;
  try {
    const section = await Section.findOne({ userId: userId, status: status });
    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      throw error;
    }
    res.status(200).json({
      message: "Section details fetched successfully",
      section,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateSectionStatus = async (req, res, next) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      const error = new Error("Section not found");
      error.status = 404;
      throw error;
    }
    section.status = req.params.status;
    const updatedSection = await section.save();
    res.status(200).json({
      message: "Section status updated successfully",
      updatedSection,
    });
  } catch (error) {
    next(error);
  }
};
