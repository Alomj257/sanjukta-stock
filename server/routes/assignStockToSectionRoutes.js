const { addStock, updateStock, deleteStock, getStocks,getAllStocksByDate } = require("../controllers/assignStockToSection");

const assingStockToSectionRoutes=require("express").Router();

assingStockToSectionRoutes.post("/:sectionId/",addStock);
assingStockToSectionRoutes.put("/:sectionId/:stockId/:date",updateStock);
assingStockToSectionRoutes.delete("/:sectionId/:stockId/:date",deleteStock);
assingStockToSectionRoutes.get("/:sectionId/",getStocks);
assingStockToSectionRoutes.get("/:sectionId/:date",getAllStocksByDate);


module.exports=assingStockToSectionRoutes;