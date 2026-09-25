import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';
export const models = [
  { id: 'amazon.nova-pro-v1:0', label: 'Nova Pro', detail: 'Balanced study generation' },
  { id: 'openai.gpt-oss-120b-1:0', label: 'OpenAI GPT OSS 120B', detail: 'Reasoning and explanations' },
  { id: 'amazon.nova-lite-v1:0', label: 'Nova Lite', detail: 'Faster study drafts' }
];
export type Turn = { role: 'user' | 'assistant'; text: string };
export async function invoke(system: string, messages: Turn[], selected?: string, maxTokens = 6000) {
  const modelId = selected || process.env.BEDROCK_MODEL_ID || models[0].id;
  // Project policy disallows cross-Region routing: never silently substitute an inference profile.
  if (!models.some(m => m.id === modelId)) throw new Error('Choose one of the configured in-Region models.');
  if (!process.env.AWS_REGION) throw new Error('The AWS Region is not configured.');
  if (!process.env.AWS_BEARER_TOKEN_BEDROCK && !process.env.BEDROCK_API_KEY) throw new Error('The AI service is not configured.');
  const token = process.env.AWS_BEARER_TOKEN_BEDROCK || process.env.BEDROCK_API_KEY;
  const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION, maxAttempts: 2, retryMode: 'adaptive', token: { token: token! } });
  try {
    const response = await client.send(new ConverseCommand({ modelId, system: [{ text: system }], messages: messages.map(m => ({ role: m.role, content: [{ text: m.text }] })), inferenceConfig: { maxTokens, temperature: 0.25 } }), { abortSignal: AbortSignal.timeout(110000) });
    if (response.stopReason === 'max_tokens') throw new Error('The model response was too long. Try a smaller study set.');
    const text = response.output?.message?.content?.map(c => c.text || '').join('') || '';
    if (!text.trim()) throw new Error('The model returned an empty response.');
    return { text, modelId, usage: response.usage, latencyMs: response.metrics?.latencyMs };
  } catch (err: any) {
    if (['AccessDeniedException','UnrecognizedClientException','ExpiredTokenException'].includes(err.name)) throw new Error('The configured model is not accessible with this key. Check model access and key validity in AWS.');
    if (err.name === 'ThrottlingException') throw new Error(/tokens per day/i.test(err.message) ? 'AWS reports that the daily model token quota is exhausted. Your remaining credits do not override that quota. Try after the quota resets or review your Bedrock quota in the AWS Service Quotas console.' : 'The model is busy. Please wait a moment and retry.');
    if (err.name === 'ValidationException') throw new Error('This model is not available for the configured in-Region request. Select another model.');
    if (err.name === 'AbortError' || err.name === 'TimeoutError') throw new Error('The model took too long. Your notes are saved; please retry.');
    throw err;
  } finally { client.destroy(); }
}

