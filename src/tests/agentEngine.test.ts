import { processAgentMessage } from '../services/agentEngine';

async function runAgentEngineTests() {
  console.log('🧪 Running Agent Engine Test Suite...\n');

  // Test 1: Describe Me intent
  const res1 = await processAgentMessage({
    message: 'describe me',
    authorUsername: 'alex_chen'
  });
  if (res1.intent !== 'describe_me') {
    throw new Error(`Expected intent "describe_me", got "${res1.intent}"`);
  }
  console.log('✅ Test 1 Passed: Intent "describe_me" correctly classified.');

  // Test 2: Describe Repo intent
  const res2 = await processAgentMessage({
    message: 'describe repo phgrey/grafin',
    authorUsername: 'alex_chen'
  });
  if (res2.intent !== 'describe_repo') {
    throw new Error(`Expected intent "describe_repo", got "${res2.intent}"`);
  }
  console.log('✅ Test 2 Passed: Intent "describe_repo" correctly classified.');

  // Test 3: Match Position intent
  const res3 = await processAgentMessage({
    message: 'match me against position: Senior AI Engineer',
    authorUsername: 'alex_chen'
  });
  if (res3.intent !== 'match_position') {
    throw new Error(`Expected intent "match_position", got "${res3.intent}"`);
  }
  console.log('✅ Test 3 Passed: Intent "match_position" correctly classified.');

  // Test 4: Cross-Entity Comparer intent
  const res4 = await processAgentMessage({
    message: 'Compare CV vs Position: Senior AI Systems Engineer',
    authorUsername: 'alex_chen'
  });
  if (res4.intent !== 'compare_entities') {
    throw new Error(`Expected intent "compare_entities", got "${res4.intent}"`);
  }
  console.log('✅ Test 4 Passed: Intent "compare_entities" correctly classified.');

  console.log('\n🎉 ALL AGENT ENGINE TESTS PASSED SUCCESSFULLY!');
}

if (process.argv[1]?.includes('agentEngine.test.ts')) {
  runAgentEngineTests().catch(err => {
    console.error('❌ Test Failure:', err);
    process.exit(1);
  });
}

export { runAgentEngineTests };
