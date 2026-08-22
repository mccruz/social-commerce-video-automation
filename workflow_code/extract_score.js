const rows = $input.all().map(item => item.json);

const clamp = value => Math.max(0, Math.min(100, value));
const parseNumber = value => {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(String(value).replace(/,/g, '').replace(/[^0-9.+-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
};
const parseCompact = value => {
  const match = String(value || '').replace(/,/g, '').trim().match(/^([0-9]+(?:\.[0-9]+)?)([kKmM])?$/);
  if (!match) return parseNumber(value);
  const multiplier = match[2]?.toLowerCase() === 'k' ? 1000 : match[2]?.toLowerCase() === 'm' ? 1000000 : 1;
  return Math.round(Number(match[1]) * multiplier);
};
const pick = (text, pattern) => {
  const match = String(text || '').match(pattern);
  return match ? String(match[1]).trim() : null;
};
const countKeywords = (text, words) => words.filter(word => text.includes(word)).length;

const weights = {
  commuterFit: 0.20,
  commissionEconomics: 0.25,
  demand: 0.15,
  videoFit: 0.15,
  trust: 0.10,
  angleDepth: 0.10,
  seasonality: 0.05
};
const commuterWords = ['commuter', 'motorcycle', 'rain', 'waterproof', 'reflective', 'compact', 'portable', 'backpack', 'bottle', 'safety'];
const videoWords = ['waterproof', 'reflective', 'compact', 'adjustable', 'anti-slip', 'lightweight', 'foldable', 'insulated', 'breathable'];
const angleBuckets = [
  ['rain', 'waterproof', 'weather'],
  ['reflective', 'safety'],
  ['compact', 'foldable', 'portable'],
  ['adjustable', 'anti-slip', 'breathable'],
  ['storage', 'pouch', 'bag'],
  ['insulated', 'bottle', 'tumbler']
];

return rows.map(row => {
  const source = `${row.RawListingText || ''}\n${row.RawAffiliateMetrics || ''}`;
  const lower = source.toLowerCase();
  const productName = pick(row.RawListingText, /(?:^|\n)\s*Title\s*:\s*([^\n]+)/i);
  const category = pick(row.RawListingText, /(?:^|\n)\s*Category\s*:\s*([^\n]+)/i);
  const price = parseNumber(pick(source, /(?:^|\n)\s*Price\s*:\s*(?:PHP|P)?\s*([\d,.]+)/i));
  const commissionPercent = parseNumber(pick(row.RawAffiliateMetrics, /Commission\s*rate\s*:\s*([\d.]+)\s*%/i));
  const monthlySold = parseCompact(pick(source, /(?:^|\n)\s*Sold\s*:\s*([\d,.]+\s*[kKmM]?)/i));
  const rating = parseNumber(pick(source, /(?:^|\n)\s*Rating\s*:\s*([\d.]+)/i));
  const reviewCount = parseCompact(pick(source, /(?:^|\n)\s*Reviews\s*:\s*([\d,.]+\s*[kKmM]?)/i));

  const missing = [];
  if (!row.CandidateId) missing.push('CandidateId');
  if (!productName) missing.push('ProductName');
  if (!category) missing.push('Category');
  if (!(price > 0)) missing.push('Price');
  if (!(commissionPercent > 0)) missing.push('CommissionRate');
  if (!(monthlySold >= 0)) missing.push('MonthlySold');
  if (!(rating >= 1 && rating <= 5)) missing.push('Rating');
  if (!(reviewCount >= 0)) missing.push('ReviewCount');
  if (!row.FactsVerified) missing.push('FactsVerified');
  if (!row.RightsConfirmed) missing.push('RightsConfirmed');
  if (!row.ImageRightsEvidence) missing.push('ImageRightsEvidence');

  const estimatedCommission = price && commissionPercent ? price * (commissionPercent / 100) : null;
  const commuterFit = clamp(25 + countKeywords(lower, commuterWords) * 9);
  const videoFit = clamp(25 + countKeywords(lower, videoWords) * 8);
  const angleDepth = clamp(20 + angleBuckets.filter(bucket => bucket.some(word => lower.includes(word))).length * 13);
  const rainySeason = Number(row.ScoringMonth) >= 6 && Number(row.ScoringMonth) <= 11;
  const seasonality = /rain|waterproof|weather/.test(lower) ? (rainySeason ? 90 : 65) : 65;
  const commissionScore = estimatedCommission === null ? 0 : clamp(estimatedCommission);
  const demandScore = monthlySold === null ? 0 : clamp((Math.log10(1 + monthlySold) / 4) * 100);
  const ratingScore = rating === null ? 0 : clamp(((rating - 3.5) / 1.5) * 100);
  const reviewScore = reviewCount === null ? 0 : clamp((Math.log10(1 + reviewCount) / 4) * 100);
  const trustScore = ratingScore * 0.7 + reviewScore * 0.3;
  const eligible = missing.length === 0;
  const selectionScore = eligible ? Math.round((
    commuterFit * weights.commuterFit +
    commissionScore * weights.commissionEconomics +
    demandScore * weights.demand +
    videoFit * weights.videoFit +
    trustScore * weights.trust +
    angleDepth * weights.angleDepth +
    seasonality * weights.seasonality
  ) * 10) / 10 : null;

  return {
    json: {
      ...row,
      ProductName: productName,
      Category: category,
      PricePHP: price,
      CommissionRatePercent: commissionPercent,
      MonthlySold: monthlySold,
      Rating: rating,
      ReviewCount: reviewCount,
      EstimatedCommissionPHP: estimatedCommission === null ? null : Math.round(estimatedCommission * 100) / 100,
      ScoreComponents: {
        commissionEconomics: Math.round(commissionScore * 10) / 10,
        commuterFit,
        demand: Math.round(demandScore * 10) / 10,
        videoFit,
        trust: Math.round(trustScore * 10) / 10,
        angleDepth,
        seasonality
      },
      ScoringWeights: weights,
      Eligible: eligible,
      SelectionScore: selectionScore,
      SelectionReason: eligible ? 'Passed extraction, evidence, and media-rights gates' : `Needs: ${missing.join(', ')}`,
      ExtractionMode: 'USER_SUPPLIED_TEXT_ONLY',
      MarketplaceQueried: false
    }
  };
});
