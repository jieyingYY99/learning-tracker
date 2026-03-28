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

export interface Review {
  date: string;
  completed: boolean;
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

export interface TrackerData {
  concepts: Concept[];
  last_updated: string;
  weeks: Week[];
  pages?: Page[];
}
