import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { authorizeRoles } from "../../middleware/authorizeRoles.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import { adminUsersService } from "./adminUsers.service.js";

export const adminUsersRoutes = Router();
adminUsersRoutes.use(authenticate, authorizeRoles("admin"));
adminUsersRoutes.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
adminUsersRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Registered users retrieved",
      await adminUsersService.list(req.query, req.currentUser),
    );
  }),
);
adminUsersRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Registered user retrieved",
      await adminUsersService.detail(req.params.id, req.currentUser),
    );
  }),
);
