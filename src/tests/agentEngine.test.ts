import { describe, it, expect } from 'vitest';
import { processAgentMessage } from '../services/agentEngine';

describe('AgentEngine Intent Classification & Skill Routing', () => {
  it('should correctly classify "describe_me" intent', async () => {
    const res = await processAgentMessage({
      message: 'describe me',
      authorUsername: 'alex_chen'
    });
    expect(res.intent).toBe('describe_me');
  });

  it('should correctly classify "describe_repo" intent', async () => {
    const res = await processAgentMessage({
      message: 'describe repo phgrey/grafin',
      authorUsername: 'alex_chen'
    });
    expect(res.intent).toBe('describe_repo');
  });

  it('should correctly classify "match_position" intent', async () => {
    const res = await processAgentMessage({
      message: 'match me against position: Senior AI Engineer',
      authorUsername: 'alex_chen'
    });
    expect(res.intent).toBe('match_position');
  });

  it('should correctly classify "compare_entities" intent', async () => {
    const res = await processAgentMessage({
      message: 'Compare CV vs Position: Senior AI Systems Engineer',
      authorUsername: 'alex_chen'
    });
    expect(res.intent).toBe('compare_entities');
  });
});
