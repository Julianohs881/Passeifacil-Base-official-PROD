
import { Quiz } from "@/types";

// Extended Quiz type with creator info
export interface ExtendedQuiz extends Quiz {
  createdBy: string;
  access_count?: number;
}
