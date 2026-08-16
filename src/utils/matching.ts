import { Item, MatchResult, MatchReasonDetail } from '../types';

export const calculateMatchScore = (lostItem: Item, foundItem: Item): {
  score: number;
  confidenceLabel: 'High Probability' | 'Moderate Match' | 'Low Possibility';
  reasons: string[];
  granularBreakdown: MatchReasonDetail[];
  aiSummary: string;
} => {
  let score = 0;
  const reasons: string[] = [];
  const granularBreakdown: MatchReasonDetail[] = [];

  // 1. Category Match (25 pts)
  const isCategoryMatch = lostItem.category === foundItem.category;
  if (isCategoryMatch) {
    score += 25;
    reasons.push(`✓ Same item category (${lostItem.category})`);
    granularBreakdown.push({
      title: 'Item Category',
      matched: true,
      scoreContribution: 25,
      detail: `Both reported as "${lostItem.category}"`,
    });
  } else {
    granularBreakdown.push({
      title: 'Item Category',
      matched: false,
      scoreContribution: 0,
      detail: `Different categories (${lostItem.category} vs ${foundItem.category})`,
    });
  }

  // 2. Brand / Model Match (15 pts)
  const lostBrand = (lostItem.brand || '').toLowerCase().trim();
  const foundBrand = (foundItem.brand || '').toLowerCase().trim();
  let brandMatched = false;
  if (lostBrand && foundBrand && (lostBrand === foundBrand || lostBrand.includes(foundBrand) || foundBrand.includes(lostBrand))) {
    score += 15;
    brandMatched = true;
    reasons.push(`✓ Same brand/make (${lostItem.brand})`);
    granularBreakdown.push({
      title: 'Brand / Make',
      matched: true,
      scoreContribution: 15,
      detail: `Brand "${lostItem.brand}" recognized across reports`,
    });
  } else {
    // Check title mentions
    const lostTitleWords = lostItem.title.toLowerCase().split(/\W+/);
    const foundTitleWords = foundItem.title.toLowerCase().split(/\W+/);
    const brandTokens = ['casio', 'apple', 'dell', 'lenovo', 'sony', 'hp', 'nike', 'adidas', 'wildcraft', 'samsung', 'noise', 'boat'];
    const matchingBrand = brandTokens.find((b) => lostTitleWords.includes(b) && foundTitleWords.includes(b));
    if (matchingBrand) {
      score += 15;
      brandMatched = true;
      const capBrand = matchingBrand.toUpperCase();
      reasons.push(`✓ Brand signature identified: ${capBrand}`);
      granularBreakdown.push({
        title: 'Brand / Make',
        matched: true,
        scoreContribution: 15,
        detail: `Brand keyword "${capBrand}" present in both titles`,
      });
    } else {
      granularBreakdown.push({
        title: 'Brand / Make',
        matched: false,
        scoreContribution: 0,
        detail: 'No matching brand signatures identified',
      });
    }
  }

  // 3. Location Match & Spot Proximity (20 pts)
  const isLocationMatch = lostItem.location === foundItem.location;
  if (isLocationMatch) {
    score += 14;
    let spotNote = '';
    if (lostItem.roomDetails && foundItem.roomDetails) {
      const lostWords = lostItem.roomDetails.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const foundWords = foundItem.roomDetails.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const overlap = lostWords.filter((w) => foundWords.includes(w));
      if (overlap.length > 0) {
        score += 6;
        spotNote = ` (Matching spot: "${overlap.join(', ')}")`;
      }
    }
    reasons.push(`✓ Same campus location (${lostItem.location})${spotNote}`);
    granularBreakdown.push({
      title: 'Campus Location',
      matched: true,
      scoreContribution: spotNote ? 20 : 14,
      detail: `Both logged at ${lostItem.location}${spotNote}`,
    });
  } else {
    granularBreakdown.push({
      title: 'Campus Location',
      matched: false,
      scoreContribution: 0,
      detail: `Locations differ (${lostItem.location} vs ${foundItem.location})`,
    });
  }

  // 4. Date Proximity (15 pts)
  if (lostItem.date && foundItem.date) {
    const lostDate = new Date(lostItem.date).getTime();
    const foundDate = new Date(foundItem.date).getTime();
    const diffDays = Math.abs((foundDate - lostDate) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      score += 15;
      reasons.push('✓ Reported on the exact same date');
      granularBreakdown.push({
        title: 'Date Timeline',
        matched: true,
        scoreContribution: 15,
        detail: 'Same-day timeline match',
      });
    } else if (diffDays <= 1) {
      score += 12;
      reasons.push('✓ Reported within 24 hours of each other');
      granularBreakdown.push({
        title: 'Date Timeline',
        matched: true,
        scoreContribution: 12,
        detail: 'Within 24-hour reporting window',
      });
    } else if (diffDays <= 3) {
      score += 8;
      reasons.push('✓ Reported within 3 days');
      granularBreakdown.push({
        title: 'Date Timeline',
        matched: true,
        scoreContribution: 8,
        detail: 'Within 3-day reporting window',
      });
    } else if (diffDays <= 7) {
      score += 4;
      reasons.push('✓ Reported within same week');
      granularBreakdown.push({
        title: 'Date Timeline',
        matched: true,
        scoreContribution: 4,
        detail: 'Within 7-day reporting window',
      });
    } else {
      granularBreakdown.push({
        title: 'Date Timeline',
        matched: false,
        scoreContribution: 0,
        detail: `Reported >7 days apart (${lostItem.date} vs ${foundItem.date})`,
      });
    }
  }

  // 5. Color Similarity (10 pts)
  const lostColor = (lostItem.color || '').toLowerCase().trim();
  const foundColor = (foundItem.color || '').toLowerCase().trim();
  if (lostColor && foundColor && (lostColor === foundColor || lostColor.includes(foundColor) || foundColor.includes(lostColor))) {
    score += 10;
    reasons.push(`✓ Color match (${lostItem.color})`);
    granularBreakdown.push({
      title: 'Color Profile',
      matched: true,
      scoreContribution: 10,
      detail: `Color match: "${lostItem.color}"`,
    });
  } else {
    granularBreakdown.push({
      title: 'Color Profile',
      matched: false,
      scoreContribution: 0,
      detail: lostColor || foundColor ? `Color variation: ${lostColor || 'Unspecified'} vs ${foundColor || 'Unspecified'}` : 'Color not specified',
    });
  }

  // 6. Semantic Description & Visual Tags Similarity (15 pts)
  const lostText = `${lostItem.title} ${lostItem.description} ${(lostItem.visualTags || []).join(' ')}`.toLowerCase();
  const foundText = `${foundItem.title} ${foundItem.description} ${(foundItem.visualTags || []).join(' ')}`.toLowerCase();

  const stopWords = new Set(['the', 'and', 'with', 'for', 'this', 'that', 'have', 'from', 'near', 'some', 'lost', 'found', 'item', 'campus', 'room']);
  const lostKeywords = lostText.split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w));
  const foundKeywords = foundText.split(/\W+/).filter((w) => w.length > 2 && !stopWords.has(w));

  const commonKeywords = Array.from(new Set(lostKeywords.filter((w) => foundKeywords.includes(w))));
  if (commonKeywords.length > 0) {
    const kwScore = Math.min(15, commonKeywords.length * 4 + 3);
    score += kwScore;
    reasons.push(`✓ Key characteristics match: "${commonKeywords.slice(0, 3).join(', ')}"`);
    granularBreakdown.push({
      title: 'Semantic Description',
      matched: true,
      scoreContribution: kwScore,
      detail: `Matched terms: ${commonKeywords.join(', ')}`,
    });
  } else {
    granularBreakdown.push({
      title: 'Semantic Description',
      matched: false,
      scoreContribution: 0,
      detail: 'No high-confidence textual keyword overlap',
    });
  }

  const finalScore = Math.min(100, Math.max(0, Math.round(score)));
  let confidenceLabel: 'High Probability' | 'Moderate Match' | 'Low Possibility' = 'Low Possibility';
  if (finalScore >= 75) confidenceLabel = 'High Probability';
  else if (finalScore >= 45) confidenceLabel = 'Moderate Match';

  let aiSummary = `AI calculated a ${finalScore}% match probability based on overlapping campus characteristics.`;
  if (finalScore >= 80) {
    aiSummary = `Strong correlation (${finalScore}%). Category, zone, and time window align tightly. Recommended for ownership verification.`;
  } else if (finalScore >= 50) {
    aiSummary = `Moderate correlation (${finalScore}%). Shared category and general area; verify private identifying details.`;
  }

  return {
    score: finalScore,
    confidenceLabel,
    reasons,
    granularBreakdown,
    aiSummary,
  };
};

/**
 * Finds all smart matches for a given item among existing items
 */
export const findSmartMatchesForItem = (targetItem: Item, allItems: Item[], minScore: number = 25): MatchResult[] => {
  const isTargetLost = targetItem.type === 'Lost';
  const candidateItems = allItems.filter(
    (item) => item.id !== targetItem.id && item.type !== targetItem.type && item.status !== 'Found'
  );

  const results: MatchResult[] = [];

  for (const candidate of candidateItems) {
    const lost = isTargetLost ? targetItem : candidate;
    const found = isTargetLost ? candidate : targetItem;

    const { score, confidenceLabel, reasons, granularBreakdown, aiSummary } = calculateMatchScore(lost, found);
    if (score >= minScore) {
      results.push({
        lostItem: lost,
        foundItem: found,
        score,
        confidenceLabel,
        reasons,
        granularBreakdown,
        aiSummary,
      });
    }
  }

  return results.sort((a, b) => b.score - a.score);
};

/**
 * Calculate similarity for Image-to-Image / Visual Search
 */
export const calculateVisualSearchMatch = (
  queryTags: string[],
  queryCategory: string,
  queryColor: string,
  targetItem: Item
): number => {
  let score = 20;

  if (targetItem.category === queryCategory) {
    score += 35;
  }

  if (queryColor && targetItem.color && targetItem.color.toLowerCase().includes(queryColor.toLowerCase())) {
    score += 20;
  }

  const targetTags = targetItem.visualTags || [];
  const targetText = `${targetItem.title} ${targetItem.description}`.toLowerCase();

  let tagMatches = 0;
  for (const tag of queryTags) {
    if (targetTags.includes(tag) || targetText.includes(tag.toLowerCase())) {
      tagMatches++;
    }
  }

  if (tagMatches > 0) {
    score += Math.min(25, tagMatches * 8);
  }

  return Math.min(98, score);
};
