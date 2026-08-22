const evaluated = $input.all().map(item => item.json);
const ranked = evaluated
  .filter(candidate => candidate.Eligible)
  .sort((a, b) =>
    b.SelectionScore - a.SelectionScore ||
    b.EstimatedCommissionPHP - a.EstimatedCommissionPHP ||
    b.MonthlySold - a.MonthlySold ||
    a.CandidateId.localeCompare(b.CandidateId)
  )
  .map((candidate, index) => ({ ...candidate, Rank: index + 1 }));

if (!ranked.length) throw new Error('No candidate passed the extraction, evidence, and rights gates');

return [{
  json: {
    RunStatus: 'TOP_CANDIDATE_READY',
    Niche: 'Practical Commuter Finds',
    CandidateCount: evaluated.length,
    EligibleCount: ranked.length,
    RankingMethod: 'DETERMINISTIC_WEIGHTED_SCORE',
    SelectedCandidate: ranked[0],
    RankedCandidates: ranked.map(candidate => ({
      CandidateId: candidate.CandidateId,
      ProductName: candidate.ProductName,
      Rank: candidate.Rank,
      SelectionScore: candidate.SelectionScore,
      EstimatedCommissionPHP: candidate.EstimatedCommissionPHP,
      ScoreComponents: candidate.ScoreComponents
    })),
    PaidGenerationTriggered: false,
    PublishingTriggered: false
  }
}];
