const { authenticateToken, checkPermissions } = require("../controllers/auth.controller");
const { createController } = require("../controllers/generic.controller")
const { selectAll, selectOne, createOne, updateOne, deleteOne } = require("../utils/handlerFactory")
const express = require("express")
const route = express.Router({ mergeParams: true }) // mergeParams is needed to access :models from parent router

// Chỉ áp dụng authenticateToken cho tất cả các route trong file này
route.use(authenticateToken);

// Áp dụng checkPermissions cho từng route cụ thể
route.get("/", checkPermissions, createController(selectAll));

route.get("/:id", checkPermissions, createController(selectOne));

route.post("/", checkPermissions, createController(createOne));

route.put("/:id", checkPermissions, createController(updateOne));

route.delete("/:id", checkPermissions, createController(deleteOne));

module.exports = route