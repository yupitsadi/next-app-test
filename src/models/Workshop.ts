// models/Workshop.ts
import mongoose, { Schema, Document} from "mongoose";

interface BaseDescriptionItem {
  type: "paragraph" | "list";
}

interface ParagraphDescription extends BaseDescriptionItem {
  type: "paragraph";
  content: string;
}

interface ListDescription extends BaseDescriptionItem {
  type: "list";
  content: string[];
}

type DescriptionItem = ParagraphDescription | ListDescription;

export interface WorkshopDocument extends Document {
  _id: mongoose.Types.ObjectId;
  theme: string;
  date: {
    time_slots: string[];
    list_datetime: Date;
  };
  date_of_workshop: string;
  duration: number;
  rate: number;
  video_url: string;
  description: DescriptionItem[];
  location: {
    address: string;
    city: string;
    country: string;
  };
  likes: number;
  rating: number;
  children_enrolled: number;
  kit_name: string;
}

const WorkshopSchema = new Schema<WorkshopDocument>({
  theme: { type: String, required: true },
  date: {
    time_slots: { type: [String], required: true },
    list_datetime: { type: Date, required: true },
  },
  date_of_workshop: { type: String, required: true },
  duration: { type: Number, required: true },
  rate: { type: Number, required: true },
  video_url: { type: String, required: true },
  description: [
    {
      type: { type: String, enum: ["paragraph", "list"], required: true },
      content: { type: Schema.Types.Mixed, required: true },
    },
  ],
  location: {
    address: { type: String, required: true },
    city: { type: String, required: true },
    country: { type: String, required: true },
  },
  likes: { type: Number, required: true },
  rating: { type: Number, required: true },
  children_enrolled: { type: Number, required: true },
  kit_name: { type: String, required: true },
});

export const workshop =
  mongoose.models.workshop ||
  mongoose.model<WorkshopDocument>(
    "workshop",
    WorkshopSchema,
    "workshop_details"
  );
