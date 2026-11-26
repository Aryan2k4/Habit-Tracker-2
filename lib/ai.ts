import type { WebWorkerMLCEngine } from '@mlc-ai/web-llm';
import AIWorker from '../workers/ai.worker?worker';
let engine: WebWorkerMLCEngine | null = null;
let worker: Worker | null = null;
let rejectPending: ((error: Error) => void) | null = null;
export function stopAI() {
  worker?.terminate(); worker = null; engine = null;
  rejectPending?.(new Error('Local AI stopped. You can reload it whenever you need it.'));
  rejectPending = null;
}
async function bounded<T>(job: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const interrupted = new Promise<never>((_, reject) => {
    rejectPending = reject;
    timer = setTimeout(() => {
      worker?.terminate(); worker = null; engine = null;
      reject(new Error('The local model took too long. Try again on a supported device or use the guided planner.'));
    }, milliseconds);
  });
  try { return await Promise.race([job, interrupted]); }
  finally { clearTimeout(timer); rejectPending = null; }
}
export async function loadAI(onProgress: (text: string) => void) {
  if (engine) return;
  if (!('gpu' in navigator)) throw new Error('Local AI requires WebGPU, such as current Chrome or Edge on supported hardware. The guided planner works on every device.');
  const {CreateWebWorkerMLCEngine, prebuiltAppConfig} = await import('@mlc-ai/web-llm');
  const selected = prebuiltAppConfig.model_list.find(m=>m.model_id.startsWith('Qwen2.5-0.5B-Instruct') && m.model_id.includes('q4f16'));
  if (!selected) throw new Error('The local model is unavailable in this runtime.');
  worker = new AIWorker();
  try {
    engine = await bounded(CreateWebWorkerMLCEngine(worker, selected.model_id, {initProgressCallback:p=>onProgress(p.text)}, {context_window_size:2048}), 180000);
  } catch(error) {worker?.terminate(); worker=null; engine=null; throw error;}
}
export async function askAI(prompt:string) {
  if (!engine) throw new Error('Load the local model first.');
  const response = await bounded(engine.chat.completions.create({messages:[{role:'system',content:'You are Bloom, a concise and kind habit coach. Suggest practical, small daily actions. Never invent user history. Do not give medical advice. Use plain text and stay below 160 words.'},{role:'user',content:prompt}],temperature:0.6,max_tokens:300}), 90000);
  return response.choices[0]?.message.content ?? 'Please try again.';
}
