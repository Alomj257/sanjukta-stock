const { addSection, updateSection, deleteSection, getSectionById,getSectionByUserId, getAllSection, updateSectionStatus } = require("../controllers/sectionController");
const assingStockToSectionRoutes = require("./assignStockToSectionRoutes");
const sectionRoutes=require("express").Router();

sectionRoutes.post("/",addSection);
sectionRoutes.put("/:id",updateSection);
sectionRoutes.delete("/:id",deleteSection);
sectionRoutes.get("/:id",getSectionById);
sectionRoutes.get("/user/data/:userId/:status",getSectionByUserId);
sectionRoutes.get("/",getAllSection);
sectionRoutes.put("/status/:id/:status",updateSectionStatus);
sectionRoutes.use("/stock/",assingStockToSectionRoutes);


module.exports=sectionRoutes;