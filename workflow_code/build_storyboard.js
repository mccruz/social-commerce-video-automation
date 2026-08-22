const input = $input.first().json;
const product = input.SelectedCandidate;
const creative = input.Creative;
if (!product.ReferenceAsset || !product.RightsConfirmed) {
  throw new Error('Storyboard requires a fictional or rights-cleared reference asset');
}

const shot = {
  ShotId: 'DEMO-SHOT-01',
  DurationSeconds: 8,
  Task: 'IMAGE_TO_VIDEO',
  ReferenceAsset: product.ReferenceAsset,
  ImageRole: 'FIRST_FRAME',
  Framing: 'Medium vertical smartphone product shot with the item inside the safe area.',
  CameraMotion: 'One slow restrained push-in with subtle natural handheld movement.',
  SubjectAction: 'One small natural movement demonstrates the product while its construction and proportions remain unchanged.',
  EnvironmentMotion: 'Light rain and faint background motion remain natural and secondary to the product.',
  Lighting: 'Soft overcast daylight with realistic reflections and restrained contrast.',
  Audio: 'Environmental ambience only; no dialogue and no music.',
  ContinuityAnchors: [
    'Preserve exact product shape, color, proportions, construction, and visible features.',
    'Preserve the supplied composition as the opening frame.',
    'Keep all people, objects, and relative positions structurally unchanged.'
  ],
  ForbiddenChanges: [
    'Invented text, price, discounts, badges, labels, or promotional graphics.',
    'Product, face, hand, body, vehicle, or accessory morphing.',
    'Extra people, objects, scene cuts, or unrealistic weather effects.'
  ],
  ScriptReference: {
    Hook: creative.Script.Hook,
    ProofFact: product.VerifiedFacts[0],
    CTA: creative.Script.CTA
  }
};
const validation = {
  ExactlyOneShot: true,
  DurationSupported: shot.DurationSeconds >= 3 && shot.DurationSeconds <= 10,
  Portrait: creative.Format.AspectRatio === '9:16',
  HasReferenceAsset: Boolean(shot.ReferenceAsset),
  HasContinuityAnchors: shot.ContinuityAnchors.length >= 3,
  HasForbiddenChanges: shot.ForbiddenChanges.length >= 3,
  UsesVerifiedFact: product.VerifiedFacts.includes(shot.ScriptReference.ProofFact),
  NoGeneratedDialogue: shot.Audio.includes('no dialogue')
};
if (!Object.values(validation).every(Boolean)) {
  throw new Error(`Storyboard validation failed: ${JSON.stringify(validation)}`);
}

return [{
  json: {
    ...input,
    Creative: {
      ...creative,
      Storyboard: [shot],
      StoryboardValidation: validation
    }
  }
}];
