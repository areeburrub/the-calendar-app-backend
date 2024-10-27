  import { PrismaClient, Event } from "@prisma/client";
  import { ApiError } from "../utils/apiError";
  import { CreateEventDTO, UpdateEventDTO } from "../types/event.types";

  export class EventService {
    private prisma: PrismaClient;

    constructor() {
      this.prisma = new PrismaClient();
    }

    async findAll(userId: string): Promise<Event[]> {
      return this.prisma.event.findMany({
        where: { userId },
        orderBy: { startTime: "desc" },
      });
    }

    async findById(id: string, userId: string): Promise<Event | null> {
      return this.prisma.event.findFirst({
        where: { id, userId },
      });
    }

    async create(data: CreateEventDTO, userId: string): Promise<Event> {
      return this.prisma.event.create({
        data: {
          ...data,
          startTime: new Date(data.startTime),
          endTime: new Date(data.endTime),
          userId,
        },
      });
    }

    async update(
      id: string,
      userId: string,
      data: UpdateEventDTO
    ): Promise<Event> {
      const event = await this.findById(id, userId);

      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      return this.prisma.event.update({
        where: { id },
        data: {
          ...data,
          startTime: data.startTime ? new Date(data.startTime) : undefined,
          endTime: data.endTime ? new Date(data.endTime) : undefined,
        },
      });
    }

    async delete(id: string, userId: string): Promise<void> {
      const event = await this.findById(id, userId);

      if (!event) {
        throw new ApiError(404, "Event not found");
      }

      await this.prisma.event.delete({
        where: { id },
      });
    }

    async findOverlappingEvents(
      userId: string,
      startTime: Date,
      endTime: Date,
      excludeEventId?: string
    ): Promise<Event[]> {
      return this.prisma.event.findMany({
        where: {
          userId,
          id: excludeEventId ? { not: excludeEventId } : undefined,
          OR: [
            {
              AND: [
                { startTime: { lte: startTime } },
                { endTime: { gt: startTime } },
              ],
            },
            {
              AND: [
                { startTime: { lt: endTime } },
                { endTime: { gte: endTime } },
              ],
            },
            {
              AND: [
                { startTime: { gte: startTime } },
                { endTime: { lte: endTime } },
              ],
            },
          ],
        },
      });
    }
  }
