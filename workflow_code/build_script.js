const input = $input.first()?.json ?? {};
const product = input.SelectedCandidate;
if (!product || typeof product !== 'object') {
  throw new Error('SelectedCandidate is required to build the script');
}
const facts = product.VerifiedFacts;
if (!Array.isArray(facts) || facts.length === 0 || facts.some(fact => typeof fact !== 'string' || fact.trim().length === 0)) {
  throw new Error('SelectedCandidate.VerifiedFacts must be a non-empty array of non-blank strings');
}
if (typeof product.Category !== 'string' || product.Category.trim().length === 0) {
  throw new Error('SelectedCandidate.Category must be a non-blank string');
}
const sentence = value => `${String(value).trim().replace(/[.!?]+$/, '')}.`;
const hook = `Rainy commute? Here is one practical ${product.Category.toLowerCase()} option to review.`;
const proof = `Fixture detail: ${sentence(facts[0])}`;
const cta = 'Review the product details and tagged affiliate item before publishing.';
const disclosure = product.Disclosure;
const spokenCopy = [hook, proof, cta].join(' ');
const prohibitedClaims = ['best', 'guaranteed', 'lowest price', 'limited stock', 'risk-free'];
const blockedClaim = prohibitedClaims.find(claim => spokenCopy.toLowerCase().includes(claim));
if (blockedClaim) throw new Error(`Script used prohibited claim: ${blockedClaim}`);

return [{
  json: {
    ...input,
    Creative: {
      Script: {
        Structure: 'HOOK_PROOF_CTA',
        Hook: hook,
        Proof: proof,
        SupportingFacts: facts.slice(1).map(sentence),
        CTA: cta,
        SpokenCopy: spokenCopy,
        Disclosure: disclosure,
        OnScreenTextPlan: 'Add verified text and disclosure deterministically after video generation.'
      },
      ClaimPolicy: {
        AllowedFacts: facts,
        ProhibitedClaims: prohibitedClaims,
        PricePolicy: 'Recheck price and availability at manual publishing time.'
      },
      Format: {
        AspectRatio: '9:16',
        Width: 720,
        Height: 1280,
        FramesPerSecond: 24,
        TargetSeconds: 8
      }
    }
  }
}];
