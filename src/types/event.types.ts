import { z } from "zod";

const baseEventSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().max(500).optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  fullDay: z.boolean().optional().default(false),
});

export const createEventSchema = baseEventSchema.refine(
  (data) => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    return start < end;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);


export const updateEventSchema = baseEventSchema.partial().refine(
  (data) => {
    if (data.startTime && data.endTime) {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return start < end;
    }
    return true;
  },
  {
    message: "End time must be after start time",
    path: ["endTime"],
  }
);

export type CreateEventDTO = z.infer<typeof createEventSchema>;
export type UpdateEventDTO = z.infer<typeof updateEventSchema>;

export interface EventResponse {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  userId: string;
  reminder: boolean;
  reminderAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
