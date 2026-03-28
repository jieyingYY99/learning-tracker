export interface DeepAnalysis {
  existing_implementations: {
    location: string;
    approach: string;
    key_code_pattern: string;
  }[];
  comparison: string;
  trade_offs: string;
  decision_guide: string;
}

export type FeedbackLevel = "easy" | "medium" | "hard" | "forgot";

export type MasteryLevel = "seen" | "understand" | "can_use";

export interface Review {
  date: string;
  completed: boolean;
  feedback?: FeedbackLevel;
  notes?: string;
}

export interface Concept {
  id: string;
  name: string;
  category: "frontend" | "backend" | "general";
  description: string;
  learned_date: string;
  source_commits: string[];
  deep_analysis?: DeepAnalysis;
  reviews: Review[];
  next_review: string;
  review_stage: number;
  mastery_level?: MasteryLevel;
  difficulty?: 1 | 2 | 3 | 4 | 5;
  tags?: string[];
  prerequisites?: string[];
  notes?: string;
}

export interface Recommendation {
  topic: string;
  why: string;
  how: string;
  priority: "high" | "medium" | "low";
}

export interface Week {
  week: string;
  summary: string;
  concepts_learned: string[];
  commits_analyzed: number;
  learning_recommendations?: Recommendation[];
}

export interface Page {
  filename: string;
  title: string;
  type: "weekly" | "review" | "topic";
  generated_date: string;
  concepts: string[];
}

export interface LearningRequest {
  concept_id: string;
  requested_date: string;
  reason?: string;
  status: "pending" | "addressed";
}

export interface FocusArea {
  concept: Concept;
  struggleScore: number;
  hardCount: number;
  forgotCount: number;
}

export interface TrackerData {
  concepts: Concept[];
  last_updated: string;
  weeks: Week[];
  pages?: Page[];
  learning_requests?: LearningRequest[];
  metadata?: {
    schema_version: number;
    total_reviews_completed: number;
    current_streak_days: number;
  };
}
