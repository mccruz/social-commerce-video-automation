const input = $input.first().json;

return [{
  json: {
    status: 'NOT_PUBLISHED',
    selectedCandidateId: input.SelectedCandidate.CandidateId,
    selectedProductName: input.SelectedCandidate.ProductName,
    candidateCount: input.CandidateCount,
    eligibleCount: input.EligibleCount,
    paidGenerationRequests: input.GenerationAdapter.PaidGenerationRequests,
    paidGenerationTriggered: input.GenerationAdapter.PaidGenerationTriggered,
    publishingTriggered: false,
    humanApprovalRequired: input.Approval.Status === 'REQUIRED_MANUAL_REVIEW',
    platform: input.Handoff.Platform
  }
}];
