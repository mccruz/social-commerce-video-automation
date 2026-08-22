const input = $input.first().json;

return [{
  json: {
    ...input,
    Approval: {
      Status: 'REQUIRED_MANUAL_REVIEW',
      Approved: false,
      CanPublish: false,
      RequiredReview: [
        'actual rendered video and product fidelity',
        'current product facts, seller, price, and availability',
        'affiliate and synthetic-media disclosures',
        'reference, music, and overlay rights',
        'platform format, product tags, and caption',
        'provider request receipt and final cost'
      ],
      NextProductionControl: 'Attributable approve or reject response tied to the exact media hash'
    }
  }
}];
