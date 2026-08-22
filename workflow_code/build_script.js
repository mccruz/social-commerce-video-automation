const input = $input.first().json;
const product = input.SelectedCandidate;
const facts = product.VerifiedFacts;
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
