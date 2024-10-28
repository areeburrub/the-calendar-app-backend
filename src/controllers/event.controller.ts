import { notifyUser } from "./../services/notification.service";
import { Request, Response, NextFunction } from "express";
import { EventService } from "../services/event.service";
import { ApiError } from "../utils/apiError";
import { createEventSchema, updateEventSchema } from "../types/event.types";

export class EventController {
  private eventService: EventService;

  constructor() {
    this.eventService = new EventService();
  }

  getEvents = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const events = await this.eventService.findAll(req.auth.userId);
      res.json(events);
    } catch (error) {
      next(error);
    }
  };

  getEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const event = await this.eventService.findById(
        req.params.id,
        req.auth.userId
      );

      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      res.json(event);
    } catch (error) {
      next(error);
    }
  };

  createEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = createEventSchema.parse(req.body);

      // Check for overlapping events
      const overlappingEvents = await this.eventService.findOverlappingEvents(
        req.auth.userId,
        new Date(validatedData.startTime),
        new Date(validatedData.endTime)
      );

      if (overlappingEvents.length > 0) {
        throw new ApiError(400, "Event overlaps with existing events");
      }

      const event = await this.eventService.create(
        validatedData,
        req.auth.userId
      );

      notifyUser(req.auth.userId, {
        id: event.id,
        title: "New Event Created",
        description: event.title,
      });

      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  };

  updateEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = updateEventSchema.parse(req.body);

      // If updating time, check for overlaps
      if (validatedData.startTime || validatedData.endTime) {
        const event = await this.eventService.findById(
          req.params.id,
          req.auth.userId
        );
        if (!event) {
          throw new ApiError(404, "Event not found");
        }

        const overlappingEvents = await this.eventService.findOverlappingEvents(
          req.auth.userId,
          new Date(validatedData.startTime || event.startTime),
          new Date(validatedData.endTime || event.endTime),
          req.params.id
        );

        if (overlappingEvents.length > 0) {
          throw new ApiError(400, "Event overlaps with existing events");
        }
      }

      const updatedEvent = await this.eventService.update(
        req.params.id,
        req.auth.userId,
        validatedData
      );

      res.json(updatedEvent);
    } catch (error) {
      next(error);
    }
  };

  deleteEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      await this.eventService.delete(req.params.id, req.auth.userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  };

  getUpcomingEvents = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const events = await this.eventService.findAll(req.auth.userId);
      const now = new Date();

      const upcomingEvents = events
        .filter((event) => event.startTime > now)
        .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
        .slice(0, 5);

      res.json(upcomingEvents);
    } catch (error) {
      next(error);
    }
  };

  getEventsInRange = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { start, end } = req.query;

      if (!start || !end) {
        throw new ApiError(409, "Start and end dates are required");
      }

      const startDate = new Date(start as string);
      const endDate = new Date(end as string);

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new ApiError(400, "Invalid date format");
      }

      const events = await this.eventService.findOverlappingEvents(
        req.auth.userId,
        startDate,
        endDate
      );

      res.json(events);
    } catch (error) {
      next(error);
    }
  };
}
