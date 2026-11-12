import { Router } from "express";
import { authenticate } from "../../middleware/authenticate.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { successResponse } from "../../utils/apiResponse.js";
import { eventsService as service } from "./events.service.js";
import { requireCurrentUser } from "../../utils/moduleValidation.js";
import { AppError } from "../../utils/httpError.js";

export const eventsRoutes = Router();
eventsRoutes.use(authenticate);
eventsRoutes.patch(
  "/teams/:teamId/discord",
  asyncHandler(async (req, res) => {
    await service.updateDiscord(
      req.params.teamId,
      req.body,
      requireCurrentUser(req.currentUser),
    );
    successResponse(res, "Discord workspace updated", null);
  }),
);
const boolean = (value: unknown) => {
  if (typeof value !== "boolean")
    throw new AppError(400, "A boolean value is required.");
  return value;
};
eventsRoutes.get(
  "/",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Opportunities",
      await service.list(requireCurrentUser(req.currentUser)),
    );
  }),
);
eventsRoutes.get(
  "/my-skills",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "My relevant skills",
      await service.skills(requireCurrentUser(req.currentUser)),
    );
  }),
);
eventsRoutes.get(
  "/unread",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Unread team messages",
      await service.unread(requireCurrentUser(req.currentUser)),
    );
  }),
);
eventsRoutes.post(
  "/",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Event created",
      await service.save(null, req.body, requireCurrentUser(req.currentUser)),
      201,
    );
  }),
);
eventsRoutes.get(
  "/teams/:teamId",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Workspace",
      await service.workspace(
        req.params.teamId,
        requireCurrentUser(req.currentUser),
      ),
    );
  }),
);
eventsRoutes.post(
  "/teams/:teamId/leave",
  asyncHandler(async (req, res) => {
    await service.leave(req.params.teamId, requireCurrentUser(req.currentUser));
    successResponse(res, "You left the team", null);
  }),
);
eventsRoutes.post(
  "/teams/:teamId/requests",
  asyncHandler(async (req, res) => {
    await service.request(
      req.params.teamId,
      req.body,
      requireCurrentUser(req.currentUser),
    );
    successResponse(res, "Request sent", null);
  }),
);
eventsRoutes.patch(
  "/teams/:teamId/requests/:userId",
  asyncHandler(async (req, res) => {
    await service.decide(
      req.params.teamId,
      req.params.userId,
      boolean(req.body.accept),
      requireCurrentUser(req.currentUser),
    );
    successResponse(res, "Request updated", null);
  }),
);
eventsRoutes.patch(
  "/teams/:teamId/note",
  asyncHandler(async (req, res) => {
    await service.note(
      req.params.teamId,
      req.body,
      requireCurrentUser(req.currentUser),
    );
    successResponse(res, "Objective saved", null);
  }),
);
eventsRoutes.get(
  "/teams/:teamId/messages",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Team messages",
      await service.messages(
        req.params.teamId,
        requireCurrentUser(req.currentUser),
      ),
    );
  }),
);
eventsRoutes.post(
  "/teams/:teamId/messages",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Message sent",
      await service.send(
        req.params.teamId,
        req.body,
        requireCurrentUser(req.currentUser),
      ),
      201,
    );
  }),
);
eventsRoutes.post(
  "/teams/:teamId/read",
  asyncHandler(async (req, res) => {
    await service.read(req.params.teamId, requireCurrentUser(req.currentUser));
    successResponse(res, "Messages read", null);
  }),
);
eventsRoutes.get(
  "/:id",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Opportunity",
      await service.detail(req.params.id, requireCurrentUser(req.currentUser)),
    );
  }),
);
eventsRoutes.put(
  "/:id",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Event saved",
      await service.save(
        req.params.id,
        req.body,
        requireCurrentUser(req.currentUser),
      ),
    );
  }),
);
eventsRoutes.put(
  "/:id/interest",
  asyncHandler(async (req, res) => {
    await service.interest(
      req.params.id,
      boolean(req.body.active),
      requireCurrentUser(req.currentUser),
    );
    successResponse(res, "Interest updated", null);
  }),
);
eventsRoutes.get(
  "/:id/teams",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Teams",
      await service.teams(req.params.id, requireCurrentUser(req.currentUser)),
    );
  }),
);
eventsRoutes.post(
  "/:id/teams",
  asyncHandler(async (req, res) => {
    successResponse(
      res,
      "Team created",
      await service.createTeam(
        req.params.id,
        req.body,
        requireCurrentUser(req.currentUser),
      ),
      201,
    );
  }),
);
