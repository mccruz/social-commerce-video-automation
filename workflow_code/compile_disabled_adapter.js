const input = $input.first().json;
const shot = input.Creative.Storyboard[0];
const validation = input.Creative.StoryboardValidation;
if (!Object.values(validation).every(Boolean)) throw new Error('Refusing to compile an invalid storyboard');

const prompt = [
  '<FIRST_FRAME>',
  'Continuous unbroken portrait smartphone shot with no scene cuts.',
  shot.Framing,
  `Camera movement: ${shot.CameraMotion}`,
  `Subject action: ${shot.SubjectAction}`,
  `Environmental motion: ${shot.EnvironmentMotion}`,
  `Lighting: ${shot.Lighting}`,
  `Sound: ${shot.Audio}`,
  `Continuity requirements: ${shot.ContinuityAnchors.join('; ')}`,
  `Do not add: ${shot.ForbiddenChanges.join('; ')}`,
  'Use the supplied product reference as the starting frame and keep everything else unchanged.'
].join(' ');

return [{
  json: {
    ...input,
    GenerationAdapter: {
      Status: 'DISABLED',
      RequestStatus: 'COMPILED_NOT_SUBMITTED',
      Provider: 'NOT_CONFIGURED',
      Task: shot.Task,
      Prompt: prompt,
      RequestTemplate: {
        Input: ['RIGHTS_CLEARED_REFERENCE_ASSET', 'VALIDATED_STORYBOARD_PROMPT'],
        Output: 'VERTICAL_VIDEO_URI',
        DurationSeconds: shot.DurationSeconds,
        AspectRatio: input.Creative.Format.AspectRatio
      },
      RequiredProductionGates: [
        'explicit per-run budget approval',
        'approved provider model and terms',
        'rights evidence',
        'attributable human authorization'
      ],
      PaidGenerationRequests: 0,
      PaidGenerationTriggered: false
    }
  }
}];
