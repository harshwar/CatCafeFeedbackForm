import type { FeedbackEntry } from '../types';

export type TimeRange = '30_days' | '3_months' | '1_year' | 'all';

export const getVolumeData = (feedbacks: FeedbackEntry[], timeRange: TimeRange = '30_days') => {
  const now = new Date();
  let cutoffDate = new Date(0);

  if (timeRange === '30_days') {
    cutoffDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  } else if (timeRange === '3_months') {
    cutoffDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  } else if (timeRange === '1_year') {
    cutoffDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
  }

  const volumeMap = feedbacks.reduce((acc, curr) => {
    try {
      const dateStr = curr.timestamp.split(',')[0]; 
      const dateObj = new Date(dateStr);
      if (isNaN(dateObj.getTime())) return acc;
      if (dateObj < cutoffDate) return acc;
      
      let key = '';
      if (timeRange === '1_year' || timeRange === 'all') {
        key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}`;
      } else {
        key = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
      }
      acc[key] = (acc[key] || 0) + 1;
    } catch (e) {
      // Ignore parsing errors
    }
    return acc;
  }, {} as Record<string, number>);

  const volumeData = [];
  if (timeRange === '1_year' || timeRange === 'all') {
    // Get unique months from the map, plus we should ideally fill gaps, but sorting existing keys is safer for months right now
    const keys = Object.keys(volumeMap).sort();
    for (const rawDate of keys) {
      const [y, m] = rawDate.split('-');
      const displayDate = new Date(parseInt(y), parseInt(m) - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      volumeData.push({ rawDate, date: displayDate, count: volumeMap[rawDate] });
    }
  } else {
    // Generate continuous days to prevent line chart gaps
    for (let d = new Date(cutoffDate); d <= now; d.setDate(d.getDate() + 1)) {
      const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const displayDate = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      volumeData.push({
        rawDate: dateKey,
        date: displayDate,
        count: volumeMap[dateKey] || 0
      });
    }
  }

  return volumeData;
};

export const getSourceData = (feedbacks: FeedbackEntry[]) => {
  const sourceMap = feedbacks.reduce((acc, curr) => {
    const src = curr.source || 'Unknown';
    acc[src] = (acc[src] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = feedbacks.length || 1;
  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];
  
  return Object.entries(sourceMap)
    .map(([name, count], index) => ({
      name,
      value: Math.round((count / total) * 100),
      count,
      color: COLORS[index % COLORS.length]
    }))
    .sort((a, b) => b.value - a.value);
};

export const getPerformanceData = (feedbacks: FeedbackEntry[]) => {
  if (feedbacks.length === 0) return [];
  
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  
  const currentWeek = feedbacks.filter(fb => {
    const d = new Date(fb.timestamp);
    return (now.getTime() - d.getTime()) <= weekMs;
  });
  
  const priorWeek = feedbacks.filter(fb => {
    const d = new Date(fb.timestamp);
    const diff = now.getTime() - d.getTime();
    return diff > weekMs && diff <= (2 * weekMs);
  });

  const categories = [
    { key: 'service', label: 'Cat Interaction' },
    { key: 'foodQuality', label: 'Food Quality' },
    { key: 'beverageQuality', label: 'Beverage Quality' },
    { key: 'atmosphere', label: 'Atmosphere' },
    { key: 'valueForMoney', label: 'Value for Money' },
    { key: 'cleanliness', label: 'Cleanliness' },
    { key: 'staffFriendliness', label: 'Staff Friendliness' }
  ];

  return categories.map(cat => {
    const getAvg = (list: FeedbackEntry[]) => {
      const scores = list
        .map(fb => parseFloat(fb[cat.key as keyof FeedbackEntry] as string))
        .filter(val => !isNaN(val));
      return scores.length > 0 ? scores.reduce((sum, val) => sum + val, 0) / scores.length : 0;
    };

    const currAvg = getAvg(currentWeek);
    const priorAvg = getAvg(priorWeek);
    const totalAvg = getAvg(feedbacks);
    const trend = priorAvg === 0 ? 0 : Number(((currAvg - priorAvg) / priorAvg * 100).toFixed(1));

    return {
      category: cat.label,
      score: Number(totalAvg.toFixed(1)),
      trend: trend
    };
  });
};

export const getDayOfWeekData = (feedbacks: FeedbackEntry[]) => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dayCounts = new Array(7).fill(0);
  
  feedbacks.forEach(fb => {
    const d = new Date(fb.timestamp);
    if (!isNaN(d.getTime())) {
      dayCounts[d.getDay()]++;
    }
  });

  return days.map((name, i) => ({
    name,
    count: dayCounts[i]
  }));
};

export const getLoyaltySplit = (feedbacks: FeedbackEntry[]) => {
  let firstTime = 0;
  let returning = 0;

  feedbacks.forEach(fb => {
    if (fb.visitedBefore?.toLowerCase().includes('yes')) {
      returning++;
    } else {
      firstTime++;
    }
  });

  return [
    { name: 'First-time', value: firstTime, color: '#f97316' },
    { name: 'Returning', value: returning, color: '#fdba74' }
  ];
};

export const getInterestProfile = (feedbacks: FeedbackEntry[]) => {
  const interestMap = feedbacks.reduce((acc, curr) => {
    if (!curr.interests) return acc;
    const tags = curr.interests.split(',').map(t => t.trim());
    tags.forEach(tag => {
      if (tag) acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(interestMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
};

export const getGeographicDistribution = (feedbacks: FeedbackEntry[]) => {
  const geoMap = feedbacks.reduce((acc, curr) => {
    const loc = curr.residence?.trim() || 'Unknown';
    if (loc) acc[loc] = (acc[loc] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(geoMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

export const getVIPList = (feedbacks: FeedbackEntry[]) => {
  return feedbacks.filter(fb => {
    if (!fb.email && !fb.phone) return false;
    
    const scores = [
      fb.service, fb.foodQuality, fb.beverageQuality, 
      fb.atmosphere, fb.valueForMoney, fb.cleanliness, fb.staffFriendliness
    ].map(s => parseFloat(s as unknown as string)).filter(s => !isNaN(s));
    
    if (scores.length === 0) return false;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return avg >= 4.8;
  });
};

export const getNeedsAttentionList = (feedbacks: FeedbackEntry[]) => {
  return feedbacks.filter(fb => {
    if (!fb.email && !fb.phone) return false;
    
    const scores = [
      fb.service, fb.foodQuality, fb.beverageQuality, 
      fb.atmosphere, fb.valueForMoney, fb.cleanliness, fb.staffFriendliness
    ].map(s => parseFloat(s as unknown as string)).filter(s => !isNaN(s));
    
    if (scores.length === 0) return false;
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return avg <= 3.0;
  });
};

export const getRadarData = (feedbacks: FeedbackEntry[]) => {
  return getPerformanceData(feedbacks); // Same calculation, just re-aliased for semantic clarity in Reports
};

export const getSourceROI = (feedbacks: FeedbackEntry[]) => {
  const sourceStats = feedbacks.reduce((acc, curr) => {
    const src = curr.source || 'Unknown';
    
    // Calculate the overall average rating for this specific feedback entry
    const scores = [
      curr.service, curr.foodQuality, curr.beverageQuality, 
      curr.atmosphere, curr.valueForMoney, curr.cleanliness, curr.staffFriendliness
    ].map(s => parseFloat(s as unknown as string)).filter(s => !isNaN(s));
    
    const entryAvgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    
    if (!acc[src]) acc[src] = { totalScore: 0, count: 0 };
    if (scores.length > 0) {
      acc[src].totalScore += entryAvgScore;
      acc[src].count += 1;
    }
    return acc;
  }, {} as Record<string, { totalScore: number, count: number }>);

  return Object.entries(sourceStats)
    .map(([source, stats]) => ({
      source,
      avgRating: stats.count > 0 ? Number((stats.totalScore / stats.count).toFixed(1)) : 0,
      volume: stats.count
    }))
    .sort((a, b) => b.avgRating - a.avgRating);
};

export const getOtherSourceBreakdown = (feedbacks: FeedbackEntry[]) => {
  const COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c'];
  
  // Only look at entries where source is 'Other' and otherSource has a value
  const otherEntries = feedbacks.filter(
    fb => fb.source?.toLowerCase() === 'other' && fb.otherSource?.trim()
  );

  if (otherEntries.length === 0) return [];

  const buckets: Record<string, number> = {};
  otherEntries.forEach(fb => {
    // Normalize: trim, lowercase for grouping, then title-case for display
    const raw = fb.otherSource.trim();
    const key = raw.toLowerCase();
    buckets[key] = (buckets[key] || 0) + 1;
  });

  const total = otherEntries.length || 1;

  return Object.entries(buckets)
    .map(([key, count], i) => ({
      // Restore original casing from first matching entry
      name: otherEntries.find(fb => fb.otherSource.trim().toLowerCase() === key)?.otherSource.trim() || key,
      count,
      pct: Math.round((count / total) * 100),
      color: COLORS[i % COLORS.length]
    }))
    .sort((a, b) => b.count - a.count);
};

export const getTopComments = (feedbacks: FeedbackEntry[]) => {
  const withComments = feedbacks
    .filter(fb => fb.experience && fb.experience.trim().length > 10)
    .map(fb => {
      const scores = [fb.service, fb.foodQuality, fb.beverageQuality, fb.atmosphere, fb.valueForMoney, fb.cleanliness, fb.staffFriendliness];
      const avgRating = scores.reduce((a, b) => a + (Number(b) || 0), 0) / scores.length;
      return { ...fb, avgRating };
    });

  // Sort by rating descending
  withComments.sort((a, b) => b.avgRating - a.avgRating);

  return {
    best: withComments.filter(fb => fb.avgRating >= 4.0).slice(0, 3),
    worst: withComments.slice().reverse().slice(0, 3).filter(fb => fb.avgRating < 4.0) // only show worst if rating is actually low
  };
};

/**
 * Single-pass mega-function: computes ALL analytics in one O(n) scan.
 * Use this in components that need multiple analytics simultaneously
 * to avoid re-scanning the array for each metric.
 */
export const processFeedbackData = (feedbacks: FeedbackEntry[]) => {
  const SCORE_KEYS: (keyof FeedbackEntry)[] = [
    'service', 'foodQuality', 'beverageQuality',
    'atmosphere', 'valueForMoney', 'cleanliness', 'staffFriendliness'
  ];
  const CATEGORY_LABELS = [
    'Cat Interaction', 'Food Quality', 'Beverage Quality',
    'Atmosphere', 'Value for Money', 'Cleanliness', 'Staff Friendliness'
  ];
  const SOURCE_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];
  const OTHER_COLORS = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5', '#ea580c', '#c2410c'];

  // Accumulators — all populated in a single loop
  const categoryTotals: number[] = new Array(7).fill(0);
  const categoryCounts: number[] = new Array(7).fill(0);
  const sourceMap: Record<string, { totalScore: number; count: number; raw: number }> = {};
  const geoMap: Record<string, number> = {};
  const interestMap: Record<string, number> = {};
  const otherBuckets: Record<string, number> = {};
  let firstTime = 0;
  let returning = 0;
  const vipList: FeedbackEntry[] = [];
  const attentionList: FeedbackEntry[] = [];

  feedbacks.forEach(fb => {
    // --- Per-entry average score ---
    const scores = SCORE_KEYS.map(k => parseFloat(fb[k] as unknown as string)).filter(s => !isNaN(s));
    const entryAvg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : -1;

    // --- Category totals (for radar / performance) ---
    SCORE_KEYS.forEach((k, i) => {
      const s = parseFloat(fb[k] as unknown as string);
      if (!isNaN(s)) { categoryTotals[i] += s; categoryCounts[i]++; }
    });

    // --- Source pie + ROI ---
    const src = fb.source || 'Unknown';
    if (!sourceMap[src]) sourceMap[src] = { totalScore: 0, count: 0, raw: 0 };
    sourceMap[src].raw++;
    if (entryAvg >= 0) { sourceMap[src].totalScore += entryAvg; sourceMap[src].count++; }

    // --- Other source breakdown ---
    if (fb.source?.toLowerCase() === 'other' && fb.otherSource?.trim()) {
      const key = fb.otherSource.trim().toLowerCase();
      otherBuckets[key] = (otherBuckets[key] || 0) + 1;
    }

    // --- Geographic ---
    const loc = fb.residence?.trim();
    if (loc) geoMap[loc] = (geoMap[loc] || 0) + 1;

    // --- Interests ---
    fb.interests?.split(',').map(t => t.trim()).filter(Boolean).forEach(tag => {
      interestMap[tag] = (interestMap[tag] || 0) + 1;
    });

    // --- Loyalty ---
    if (fb.visitedBefore?.toLowerCase().includes('yes')) returning++; else firstTime++;

    // --- VIP / Needs Attention ---
    if ((fb.email || fb.phone) && entryAvg >= 0) {
      if (entryAvg >= 4.8) vipList.push(fb);
      if (entryAvg <= 3.0) attentionList.push(fb);
    }
  });

  const total = feedbacks.length || 1;

  // --- Assemble results ---
  const performance = CATEGORY_LABELS.map((category, i) => ({
    category,
    score: categoryCounts[i] > 0 ? Number((categoryTotals[i] / categoryCounts[i]).toFixed(1)) : 0
  }));

  const sourceEntries = Object.entries(sourceMap);
  const sourcePie = sourceEntries
    .map(([name, s], i) => ({ name, value: Math.round((s.raw / total) * 100), count: s.raw, color: SOURCE_COLORS[i % SOURCE_COLORS.length] }))
    .sort((a, b) => b.value - a.value);

  const sourceROI = sourceEntries
    .map(([source, s]) => ({ source, avgRating: s.count > 0 ? Number((s.totalScore / s.count).toFixed(1)) : 0, volume: s.count }))
    .sort((a, b) => b.avgRating - a.avgRating);

  const otherTotal = feedbacks.filter(fb => fb.source?.toLowerCase() === 'other').length;
  const otherBreakdown = Object.entries(otherBuckets)
    .map(([key, count], i) => ({
      name: feedbacks.find(fb => fb.otherSource?.trim().toLowerCase() === key)?.otherSource?.trim() || key,
      count,
      pct: Math.round((count / (otherTotal || 1)) * 100),
      color: OTHER_COLORS[i % OTHER_COLORS.length]
    }))
    .sort((a, b) => b.count - a.count);

  const geo = Object.entries(geoMap)
    .map(([location, count]) => ({ location, count }))
    .sort((a, b) => b.count - a.count).slice(0, 5);

  const interests = Object.entries(interestMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  const loyalty = [
    { name: 'First-time', value: firstTime, color: '#f97316' },
    { name: 'Returning', value: returning, color: '#fdba74' }
  ];

  const topComments = getTopComments(feedbacks);

  return { performance, sourcePie, sourceROI, otherBreakdown, otherTotal, geo, interests, loyalty, vipList, attentionList, topComments };
};

export const getTrendData = (feedbacks: FeedbackEntry[]) => {
  const now = new Date();
  const weekMs = 7 * 24 * 60 * 60 * 1000;
  
  const currentWeek = feedbacks.filter(fb => {
    const d = new Date(fb.timestamp);
    return (now.getTime() - d.getTime()) <= weekMs;
  });
  
  const priorWeek = feedbacks.filter(fb => {
    const d = new Date(fb.timestamp);
    const diff = now.getTime() - d.getTime();
    return diff > weekMs && diff <= (2 * weekMs);
  });

  const getAvg = (list: FeedbackEntry[]) => {
    if (list.length === 0) return 0;
    const scores = list.flatMap(fb => [
      fb.service, fb.foodQuality, fb.beverageQuality, 
      fb.atmosphere, fb.valueForMoney, fb.cleanliness, fb.staffFriendliness
    ].map(s => parseFloat(s as unknown as string)).filter(s => !isNaN(s)));
    return scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  };

  const currAvg = getAvg(currentWeek);
  const priorAvg = getAvg(priorWeek);
  const ratingTrend = priorAvg === 0 ? 0 : Number(((currAvg - priorAvg) / priorAvg * 100).toFixed(1));
  const countTrend = priorWeek.length === 0 ? 0 : Number(((currentWeek.length - priorWeek.length) / priorWeek.length * 100).toFixed(1));

  return {
    currentAvg: Number(currAvg.toFixed(1)),
    priorAvg: Number(priorAvg.toFixed(1)),
    ratingTrend,
    countTrend,
    volume: currentWeek.length,
    volumeTrend: currentWeek.length - priorWeek.length
  };
};

export const getLowestCategory = (feedbacks: FeedbackEntry[]) => {
  const perf = getPerformanceData(feedbacks);
  if (perf.length === 0) return null;
  return [...perf].sort((a, b) => a.score - b.score)[0];
};
