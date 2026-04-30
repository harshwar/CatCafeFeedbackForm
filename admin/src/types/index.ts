export interface FeedbackEntry {
  fullName: string;
  phone: string;
  residence: string;
  email: string;
  service: number;
  foodQuality: number;
  beverageQuality: number;
  atmosphere: number;
  valueForMoney: number;
  cleanliness: number;
  staffFriendliness: number;
  experience: string;
  interests: string;
  visitedBefore: string;
  visitFrequency: string;
  source: string;
  otherSource: string;
  timestamp: string;
}

export interface InsightsData {
  stats: {
    total: number | string;
    avgRating: number;
    satisfaction: number;
    returningRate: number;
  };
  syncStatus: {
    localFailures: number;
    n8nConfigured: boolean;
    error?: string;
  };
  vipList: FeedbackEntry[];
  attentionList: FeedbackEntry[];
  topComments: {
    best: (FeedbackEntry & { avgRating: number })[];
    worst: (FeedbackEntry & { avgRating: number })[];
  };
  allFeedback?: FeedbackEntry[];
}
