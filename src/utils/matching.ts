import { Item, MatchResult } from '../types';

export const calculateMatchScore = (lostItem: Item, foundItem: Item): { score: number; reasons: string[] } => {
  let score = 0;
  const reasons: string[] = [];

  // 1. Category Match (25 pts max)
  if (lostItem.category === foundItem.category) {
    score += 25;
    reasons.push(`Matching Category: ${lostItem.category} (+25%)`);
  }

  // 2. Location Match (25 pts max)
  if (lostItem.location === foundItem.location) {
    score += 15;
    reasons.push(`Same Location: ${lostItem.location} (+15%)`);

    // Check room details / specific spot similarity
    if (lostItem.roomDetails && foundItem.roomDetails) {
      const lostWords = lostItem.roomDetails.toLowerCase().split(/\W+/);
      const foundWords = foundItem.roomDetails.toLowerCase().split(/\W+/);
      const overlap = lostWords.filter(w => w.length > 2 && foundWords.includes(w));
      if (overlap.length > 0) {
        score += 10;
        reasons.push(`Matching spot details "${overlap.join(', ')}" (+10%)`);
      }
    }
  }

  // 3. Date Proximity (20 pts max)
  if (lostItem.date && foundItem.date) {
    const lostDate = new Date(lostItem.date).getTime();
    const foundDate = new Date(foundItem.date).getTime();
    const diffDays = Math.abs((foundDate - lostDate) / (1000 * 3600 * 24));

    if (diffDays === 0) {
      score += 20;
      reasons.push('Reported on the exact same date (+20%)');
    } else if (diffDays <= 1) {
      score += 15;
      reasons.push('Reported within 1 day of each other (+15%)');
    } else if (diffDays <= 3) {
      score += 10;
      reasons.push('Reported within 3 days of each other (+10%)');
    } else if (diffDays <= 7) {
      score += 5;
      reasons.push('Reported within the same week (+5%)');
    }
  }

  // 4. Color & Keyword Similarity (30 pts max)
  // Color match
  if (lostItem.color && foundItem.color) {
    if (lostItem.color.toLowerCase().trim() === foundItem.color.toLowerCase().trim()) {
      score += 10;
      reasons.push(`Matching Color: ${lostItem.color} (+10%)`);
    }
  }

  // Title / Description Keyword overlap
  const lostText = `${lostItem.title} ${lostItem.description}`.toLowerCase();
  const foundText = `${foundItem.title} ${foundItem.description}`.toLowerCase();

  const stopWords = new Set(['the', 'and', 'with', 'for', 'this', 'that', 'have', 'from', 'near', 'some', 'lost', 'found', 'item']);
  const lostKeywords = lostText.split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));
  const foundKeywords = foundText.split(/\W+/).filter(w => w.length > 2 && !stopWords.has(w));

  const commonKeywords = Array.from(new Set(lostKeywords.filter(w => foundKeywords.includes(w))));
  if (commonKeywords.length > 0) {
    const kwScore = Math.min(20, commonKeywords.length * 7);
    score += kwScore;
    reasons.push(`Key terms match: "${commonKeywords.slice(0, 3).join(', ')}" (+${kwScore}%)`);
  }

  return {
    score: Math.min(100, Math.round(score)),
    reasons,
  };
};

/**
 * Finds all smart matches for a given item among existing items
 */
export const findSmartMatchesForItem = (targetItem: Item, allItems: Item[], minScore: number = 30): MatchResult[] => {
  const isTargetLost = targetItem.type === 'Lost';
  // If target is Lost, search in Found items (and vice versa)
  const candidateItems = allItems.filter(item => 
    item.id !== targetItem.id && 
    item.type !== targetItem.type && 
    item.status !== 'Found' // ignore completed items
  );

  const results: MatchResult[] = [];

  for (const candidate of candidateItems) {
    const lost = isTargetLost ? targetItem : candidate;
    const found = isTargetLost ? candidate : targetItem;

    const { score, reasons } = calculateMatchScore(lost, found);
    if (score >= minScore) {
      results.push({
        lostItem: lost,
        foundItem: found,
        score,
        reasons,
      });
    }
  }

  // Sort descending by score
  return results.sort((a, b) => b.score - a.score);
};
