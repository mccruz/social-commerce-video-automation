const candidates = [
  {
    CandidateId: 'DEMO-COMMUTER-001',
    RawListingText: [
      'Title: All-Weather Commuter Rain Cover',
      'Category: Motorcycle Rain Gear',
      'Price: PHP 699',
      'Sold: 3.2K',
      'Rating: 4.8',
      'Reviews: 890',
      'Description: Waterproof windproof commuter cover with reflective panels, compact storage pouch, adjustable cuffs, and breathable lining.'
    ].join('\n'),
    RawAffiliateMetrics: 'Commission rate: 15%',
    VerifiedFacts: [
      'Waterproof outer layer',
      'Reflective panels',
      'Compact storage pouch'
    ],
    FactsVerified: true,
    RightsConfirmed: true,
    ImageRightsEvidence: 'fictional-demo-asset',
    ReferenceAsset: 'fictional://commuter-rain-cover',
    Disclosure: '#ad #Affiliate',
    TargetPlatform: 'social_commerce_channel',
    ScoringMonth: 8
  },
  {
    CandidateId: 'DEMO-COMMUTER-002',
    RawListingText: [
      'Title: Leak-Resistant Insulated Travel Tumbler',
      'Category: Commuter Drinkware',
      'Price: PHP 499',
      'Sold: 8.4K',
      'Rating: 4.7',
      'Reviews: 2.1K',
      'Description: Portable insulated bottle with anti-slip base, adjustable carry loop, and compact cup-holder shape.'
    ].join('\n'),
    RawAffiliateMetrics: 'Commission rate: 12%',
    VerifiedFacts: [
      'Insulated body',
      'Anti-slip base',
      'Adjustable carry loop'
    ],
    FactsVerified: true,
    RightsConfirmed: true,
    ImageRightsEvidence: 'fictional-demo-asset',
    ReferenceAsset: 'fictional://travel-tumbler',
    Disclosure: '#ad #Affiliate',
    TargetPlatform: 'social_commerce_channel',
    ScoringMonth: 8
  },
  {
    CandidateId: 'DEMO-COMMUTER-003',
    RawListingText: [
      'Title: Reflective Waterproof Backpack Cover',
      'Category: Bag Accessories',
      'Price: PHP 249',
      'Sold: 15K',
      'Rating: 4.6',
      'Reviews: 3.6K',
      'Description: Lightweight waterproof backpack cover with reflective safety strip, adjustable elastic edge, and foldable storage bag.'
    ].join('\n'),
    RawAffiliateMetrics: 'Commission rate: 10%',
    VerifiedFacts: [
      'Waterproof cover',
      'Reflective safety strip',
      'Foldable storage bag'
    ],
    FactsVerified: true,
    RightsConfirmed: true,
    ImageRightsEvidence: 'fictional-demo-asset',
    ReferenceAsset: 'fictional://backpack-cover',
    Disclosure: '#ad #Affiliate',
    TargetPlatform: 'social_commerce_channel',
    ScoringMonth: 8
  }
];

return candidates.map(candidate => ({
  json: {
    ...candidate,
    InputMode: 'FICTIONAL_USER_SUPPLIED_TEXT',
    MarketplaceQueried: false,
    PaidGenerationTriggered: false,
    PublishingTriggered: false
  }
}));
