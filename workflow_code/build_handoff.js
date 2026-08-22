const input = $input.first().json;

return [{
  json: {
    ...input,
    Handoff: {
      Platform: input.TargetPlatform || 'affiliate_network',
      Mode: 'MANUAL_REVIEW_PACKAGE',
      DirectPostingEnabled: false,
      VideoAttached: false,
      ProductTagAttached: false,
      CaptionPreview: `${input.Creative.Script.SpokenCopy} ${input.Creative.Script.Disclosure}`,
      Checklist: input.Approval.RequiredReview,
      Status: 'BLOCKED_PENDING_GENERATION_AND_HUMAN_APPROVAL'
    }
  }
}];
