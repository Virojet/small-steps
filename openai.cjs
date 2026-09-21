const DEFAULT_OPENAI_MODEL = 'gpt-5-mini';

async function callOpenAI(messages, model, key, instructions, fetchImpl = fetch) {
 if (!key) throw Error('Add your OpenAI API key in Settings to start coaching.');
 const isResponsesModel = /^gpt-[56]/.test(model);
 let url, headers, body;
 if (isResponsesModel) {
  url = 'https://api.openai.com/v1/responses';
  headers = {'Content-Type':'application/json', Authorization:`Bearer ${key}`};
  body = {
   model, instructions, store: false,
   input: messages.map(m => ({role: m.role === 'model' ? 'assistant' : 'user', content: m.text})),
   max_output_tokens: 3000,
  };
  if (/^gpt-5(?:-|$)/.test(model)) body.reasoning = {effort: 'low'};
 } else {
  url = 'https://api.openai.com/v1/chat/completions';
  headers = {'Content-Type':'application/json', Authorization:`Bearer ${key}`};
  const isReasoning = /^o[13](?:-|$)/.test(model);
  body = {
   model,
   messages: [
    { role: isReasoning ? 'developer' : 'system', content: instructions },
    ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text }))
   ]
  };
  if (isReasoning) body.max_completion_tokens = 2500;
  else body.max_tokens = 2500;
 }

 let response, data;
 try {
  response = await fetchImpl(url, {
   method: 'POST', headers,
   body: JSON.stringify(body), signal: AbortSignal.timeout(60000),
  });
  data = await response.json();
 } catch (e) {
  throw Error(e.name === 'TimeoutError' || e.name === 'AbortError'
   ? 'OpenAI took too long. Please try again.'
   : 'Could not reach OpenAI. Check your internet connection and try again.');
 }
 if (!response.ok) {
  const code = data?.error?.code;
  if (response.status === 401) throw Error('OpenAI rejected this API key. Create a new key at platform.openai.com/api-keys and save it in Settings.');
  if (code === 'insufficient_quota' || code === 'billing_hard_limit_reached') throw Error('OpenAI API credit or spending limit reached. Check Billing and Limits on platform.openai.com, then try again.');
  if (response.status === 429) throw Error('OpenAI rate limit reached. Wait a moment, then try again.');
  if (response.status === 403) throw Error('This OpenAI project does not have permission to use the API or selected model. Check the key permissions and project model access.');
  if (response.status === 404) throw Error('This OpenAI model is unavailable to your project. Check the model name in Settings.');
  if (response.status === 400) throw Error('OpenAI could not accept this request. Select a supported text model in Settings and try again.');
  throw Error('OpenAI is unavailable right now. Please try again later.');
 }
 if (isResponsesModel) {
  if (data.status === 'incomplete') throw Error('OpenAI reached the response limit before finishing. Try a shorter question.');
  if (data.status === 'failed') throw Error('OpenAI could not complete this response. Please try again.');
  const content = (data.output || []).filter(item => item.type === 'message').flatMap(item => item.content || []);
  const text = content.filter(part => part.type === 'output_text').map(part => part.text || '').join('\n').trim();
  if (text) return text;
  const refusal = content.find(part => part.type === 'refusal');
  if (refusal) return refusal.refusal || 'I cannot help with that request. Try asking about a habit you want to build.';
  throw Error('OpenAI returned no text. Try rephrasing your message.');
 } else {
  const text = data.choices?.[0]?.message?.content?.trim() || '';
  if (text) return text;
  throw Error('OpenAI returned no text. Try rephrasing your message.');
 }
}
module.exports = {callOpenAI, DEFAULT_OPENAI_MODEL};
