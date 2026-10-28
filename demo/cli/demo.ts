/**
 * Algebrakit SDK tour: calls each part of the API once and prints a short summary.
 *
 *   npm run demo:setup   (then add your API key to demo/cli/.env)
 *   npm run demo
 *
 * To show an exercise to a student in the browser, see the runnable web examples:
 * https://github.com/algebrakit/algebrakit-examples
 */

import { ApiClient, IAK_Exercise } from '@algebrakit/sdk';
import { loadConfig } from './config';

const EXERCISE_ID = 'fa42e943-8213-41a6-8a91-8c22a929ffe9'; // "Solve the equation 6(p - 1) = 4p + 10"

// An exercise defined in code instead of in the Algebrakit CMS (AK_Exercise format)
const EXERCISE_SPEC: IAK_Exercise = {
  type: 'AK_Exercise',
  version: 1,
  studentProfile: 'uk_KS5',
  questionMode: 'ALL_AT_ONCE',
  symbols: [{ name: 'x', type: 'VARIABLE' }],
  elements: [
    {
      blocks: [
        { type: 'CONTENT', content: 'Simplify the following expression.' },
        {
          type: 'INTERACTION',
          interaction: { type: 'MULTISTEP', solutionPart: { task: { type: 'SIMPLIFY', expression: '2x + 3x' } } },
        },
      ],
    },
  ],
};

function step(title: string): void {
  console.log(`\n${title}`);
}

async function main(): Promise<void> {
  const config = loadConfig();
  const client = new ApiClient({ apiKey: config.apiKey, baseUrl: config.apiUrl });

  console.log('Algebrakit SDK tour');
  console.log(`API: ${config.apiUrl}`);

  step('1. Validate an exercise (validateExercise)');
  const validation = await client.validateExercise({ exerciseId: EXERCISE_ID });
  console.log(`   valid: ${validation.valid}, marks: ${validation.marks}, random: ${validation.random ?? false}`);

  step('2. Create a session (createSession)');
  const [result] = await client.createSession({ exercises: [{ exerciseId: EXERCISE_ID }] });
  if (!result.success) throw new Error(result.msg ?? 'Session creation failed');
  const session = result.sessions[0];
  console.log(`   session ID: ${session.sessionId}`);
  console.log(`   show it in a page with: <akit-exercise session-id="${session.sessionId}"></akit-exercise>`);

  step('3. Get session info (getSessionInfo)');
  const info = await client.getSessionInfo({ sessionId: session.sessionId });
  console.log(`   elements: ${info.elements.length}, created: ${new Date((info.creationTimestamp ?? 0) * 1000).toISOString()}`);

  step('4. Get the score (getSessionScore)');
  const score = await client.getSessionScore({ sessionId: session.sessionId });
  console.log(`   marks: ${score.scoring.marksEarned} of ${score.scoring.marksTotal}, finished: ${score.scoring.finished}`);

  step('5. Lock and unlock the session (lockSession)');
  await client.lockSession({ action: 'LOCK', sessionIds: [session.sessionId] });
  console.log('   locked: the student can no longer change their answers');
  await client.lockSession({ action: 'UNLOCK', sessionIds: [session.sessionId] });
  console.log('   unlocked');

  step('6. Create a session from an exercise defined in code (exerciseSpec)');
  const specValidation = await client.validateExercise({ exerciseSpec: EXERCISE_SPEC });
  console.log(`   valid: ${specValidation.valid}, marks: ${specValidation.marks}`);
  const [specResult] = await client.createSession({ exercises: [{ exerciseSpec: EXERCISE_SPEC }] });
  console.log(`   session ID: ${specResult.sessions[0].sessionId}`);

  console.log('\nDone.');
}

main().catch((error: Error) => {
  console.error(`\nDemo failed: ${error.message}`);
  process.exit(1);
});
