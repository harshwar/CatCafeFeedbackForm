import { describe, it, expect } from 'vitest';
import {
  getSourceData,
  getSourceROI,
  getLoyaltySplit,
  getOtherSourceBreakdown,
  getInterestProfile,
  getGeographicDistribution,
  processFeedbackData,
  getTopComments,
} from './analytics';
import type { FeedbackEntry } from '../types';

// ─── Fixtures ────────────────────────────────────────────────────────────────

const makeFb = (overrides: Partial<FeedbackEntry> = {}): FeedbackEntry => ({
  fullName: 'Test User',
  phone: '9999999999',
  residence: 'Mumbai',
  email: 'test@example.com',
  service: 4,
  foodQuality: 4,
  beverageQuality: 4,
  atmosphere: 4,
  valueForMoney: 4,
  cleanliness: 4,
  staffFriendliness: 4,
  experience: 'Great experience',
  interests: 'Adopting, Fostering',
  visitedBefore: 'Yes',
  visitFrequency: 'Monthly',
  source: 'Google',
  otherSource: '',
  timestamp: '2024-03-15, 10:00:00',
  ...overrides,
});

const FEEDBACKS: FeedbackEntry[] = [
  makeFb({ fullName: 'Alice', source: 'Google', service: 5, foodQuality: 5, beverageQuality: 5, atmosphere: 5, valueForMoney: 5, cleanliness: 5, staffFriendliness: 5 }),
  makeFb({ fullName: 'Bob', source: 'Instagram', service: 3, foodQuality: 3, beverageQuality: 3, atmosphere: 3, valueForMoney: 3, cleanliness: 3, staffFriendliness: 3, visitedBefore: 'No' }),
  makeFb({ fullName: 'Carol', source: 'Other', otherSource: 'TikTok', service: 4, foodQuality: 4, beverageQuality: 4, atmosphere: 4, valueForMoney: 4, cleanliness: 4, staffFriendliness: 4, visitedBefore: 'No', residence: 'Delhi' }),
  makeFb({ fullName: 'Dave', source: 'Other', otherSource: 'tiktok', service: 2, foodQuality: 2, beverageQuality: 2, atmosphere: 2, valueForMoney: 2, cleanliness: 2, staffFriendliness: 2, email: 'dave@test.com', residence: 'Mumbai' }),
];

// ─── getSourceData ────────────────────────────────────────────────────────────

describe('getSourceData', () => {
  it('returns percentage values that are non-negative', () => {
    const result = getSourceData(FEEDBACKS);
    result.forEach(d => {
      expect(d.value).toBeGreaterThanOrEqual(0);
      expect(d.value).toBeLessThanOrEqual(100);
    });
  });

  it('percentages roughly sum to 100', () => {
    const result = getSourceData(FEEDBACKS);
    const sum = result.reduce((acc, d) => acc + d.value, 0);
    // Allow ±5% rounding tolerance
    expect(sum).toBeGreaterThanOrEqual(95);
    expect(sum).toBeLessThanOrEqual(105);
  });

  it('returns empty array for no feedbacks', () => {
    expect(getSourceData([])).toEqual([]);
  });

  it('sorts by value descending', () => {
    const result = getSourceData(FEEDBACKS);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].value).toBeGreaterThanOrEqual(result[i].value);
    }
  });
});

// ─── getSourceROI ─────────────────────────────────────────────────────────────

describe('getSourceROI', () => {
  it('uses all 7 rating fields, not just service', () => {
    // Alice has all 5s → avg should be 5.0
    const result = getSourceROI(FEEDBACKS);
    const google = result.find(r => r.source === 'Google');
    expect(google).toBeDefined();
    expect(google!.avgRating).toBe(5.0);
  });

  it('Bob (all 3s) → Instagram avg = 3.0', () => {
    const result = getSourceROI(FEEDBACKS);
    const instagram = result.find(r => r.source === 'Instagram');
    expect(instagram!.avgRating).toBe(3.0);
  });

  it('sorts by avgRating descending', () => {
    const result = getSourceROI(FEEDBACKS);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].avgRating).toBeGreaterThanOrEqual(result[i].avgRating);
    }
  });

  it('returns empty array for no feedbacks', () => {
    expect(getSourceROI([])).toEqual([]);
  });
});

// ─── getLoyaltySplit ──────────────────────────────────────────────────────────

describe('getLoyaltySplit', () => {
  it('correctly splits first-time vs returning', () => {
    // Alice: Yes (returning), Bob: No, Carol: No, Dave: Yes (returning)
    const result = getLoyaltySplit(FEEDBACKS);
    const returning = result.find(r => r.name === 'Returning');
    const firstTime = result.find(r => r.name === 'First-time');
    expect(returning!.value).toBe(2);
    expect(firstTime!.value).toBe(2);
  });

  it('all first-time visitors', () => {
    const fbs = [makeFb({ visitedBefore: 'No' }), makeFb({ visitedBefore: 'No' })];
    const result = getLoyaltySplit(fbs);
    expect(result.find(r => r.name === 'First-time')!.value).toBe(2);
    expect(result.find(r => r.name === 'Returning')!.value).toBe(0);
  });
});

// ─── getOtherSourceBreakdown ──────────────────────────────────────────────────

describe('getOtherSourceBreakdown', () => {
  it('merges case-insensitive duplicates ("TikTok" and "tiktok" → 1 group)', () => {
    const result = getOtherSourceBreakdown(FEEDBACKS);
    expect(result.length).toBe(1);
    expect(result[0].count).toBe(2);
  });

  it('returns empty array when no "Other" source entries', () => {
    const fbs = [makeFb({ source: 'Google' })];
    expect(getOtherSourceBreakdown(fbs)).toEqual([]);
  });

  it('percentage = 100% when there is only one unique answer', () => {
    const result = getOtherSourceBreakdown(FEEDBACKS);
    expect(result[0].pct).toBe(100);
  });
});

// ─── getInterestProfile ───────────────────────────────────────────────────────

describe('getInterestProfile', () => {
  it('splits comma-separated interests correctly', () => {
    const result = getInterestProfile(FEEDBACKS);
    const adopting = result.find(r => r.name === 'Adopting');
    expect(adopting).toBeDefined();
    expect(adopting!.count).toBe(4); // all 4 feedbacks have "Adopting"
  });

  it('sorts by count descending', () => {
    const result = getInterestProfile(FEEDBACKS);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].count).toBeGreaterThanOrEqual(result[i].count);
    }
  });
});

// ─── getGeographicDistribution ────────────────────────────────────────────────

describe('getGeographicDistribution', () => {
  it('groups by residence correctly', () => {
    const result = getGeographicDistribution(FEEDBACKS);
    const mumbai = result.find(r => r.location === 'Mumbai');
    const delhi = result.find(r => r.location === 'Delhi');
    expect(mumbai!.count).toBe(3); // Alice (default) + Bob (default) + Dave
    expect(delhi!.count).toBe(1);  // Carol
  });

  it('returns max 5 locations', () => {
    const many = Array.from({ length: 10 }, (_, i) => makeFb({ residence: `City${i}` }));
    expect(getGeographicDistribution(many).length).toBeLessThanOrEqual(5);
  });
});

// ─── getTopComments ──────────────────────────────────────────────────────────

describe('getTopComments', () => {
  it('correctly identifies best and worst reviews with text length > 10', () => {
    const fbs = [
      makeFb({ fullName: 'A', service: 5, foodQuality: 5, beverageQuality: 5, atmosphere: 5, valueForMoney: 5, cleanliness: 5, staffFriendliness: 5, experience: 'This is an amazing place!' }),
      makeFb({ fullName: 'B', service: 1, foodQuality: 1, beverageQuality: 1, atmosphere: 1, valueForMoney: 1, cleanliness: 1, staffFriendliness: 1, experience: 'This was a terrible experience!' }),
      makeFb({ fullName: 'C', service: 4, foodQuality: 4, beverageQuality: 4, atmosphere: 4, valueForMoney: 4, cleanliness: 4, staffFriendliness: 4, experience: 'Good' }), // too short
    ];
    const { best, worst } = getTopComments(fbs);
    expect(best.length).toBe(1);
    expect(best[0].fullName).toBe('A');
    expect(worst.length).toBe(1);
    expect(worst[0].fullName).toBe('B');
  });

  it('filters out high ratings from worst list', () => {
    const fbs = [
      makeFb({ fullName: 'A', service: 5, foodQuality: 5, beverageQuality: 5, atmosphere: 5, valueForMoney: 5, cleanliness: 5, staffFriendliness: 5, experience: 'This is an amazing place!' }),
      makeFb({ fullName: 'B', service: 4.5, foodQuality: 4.5, beverageQuality: 4.5, atmosphere: 4.5, valueForMoney: 4.5, cleanliness: 4.5, staffFriendliness: 4.5, experience: 'This was a great experience!' }),
    ];
    const { worst } = getTopComments(fbs);
    expect(worst.length).toBe(0); // lowest is 4.5, which is not < 4.0
  });
});

// ─── processFeedbackData (single-pass) ───────────────────────────────────────

describe('processFeedbackData', () => {
  it('produces same sourcePie as getSourceData', () => {
    const singlePass = processFeedbackData(FEEDBACKS).sourcePie;
    const multiPass = getSourceData(FEEDBACKS);
    // Values and names should match
    singlePass.forEach((sp, i) => {
      expect(sp.name).toBe(multiPass[i].name);
      expect(sp.value).toBe(multiPass[i].value);
    });
  });

  it('produces same sourceROI as getSourceROI', () => {
    const singlePass = processFeedbackData(FEEDBACKS).sourceROI;
    const multiPass = getSourceROI(FEEDBACKS);
    singlePass.forEach((sp, i) => {
      expect(sp.source).toBe(multiPass[i].source);
      expect(sp.avgRating).toBe(multiPass[i].avgRating);
    });
  });

  it('correctly identifies VIP list (avg >= 4.8)', () => {
    const { vipList } = processFeedbackData(FEEDBACKS);
    // Alice has all 5s → avg = 5.0 → VIP
    expect(vipList.some(fb => fb.fullName === 'Alice')).toBe(true);
    // Bob has all 3s → not VIP
    expect(vipList.some(fb => fb.fullName === 'Bob')).toBe(false);
  });

  it('correctly identifies Needs Attention list (avg <= 3.0)', () => {
    const { attentionList } = processFeedbackData(FEEDBACKS);
    // Dave has all 2s → needs attention
    expect(attentionList.some(fb => fb.fullName === 'Dave')).toBe(true);
    // Alice has all 5s → does not need attention
    expect(attentionList.some(fb => fb.fullName === 'Alice')).toBe(false);
  });

  it('handles empty array without throwing', () => {
    expect(() => processFeedbackData([])).not.toThrow();
  });
});
