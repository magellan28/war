import {createContext, useContext} from 'react';
import timings from '../../public/voice/timings.json';

export type SceneInfo = {
  id: string;
  duration: number;
  voiceAt: number; // frame where narration starts
  /** frame (scene-local) where sentence i starts */
  s: (i: number) => number;
  /** frame where sentence i ends */
  e: (i: number) => number;
};

export const SceneCtx = createContext<SceneInfo | null>(null);
export const useScene = () => {
  const c = useContext(SceneCtx);
  if (!c) throw new Error('useScene outside scene');
  return c;
};

type T = Record<string, {duration: number; sentences: {start: number; end: number}[]}>;
export const makeSceneInfo = (id: string, duration: number, voiceAt: number): SceneInfo => {
  const t = (timings as T)[id];
  return {
    id,
    duration,
    voiceAt,
    s: (i) => voiceAt + Math.round((t?.sentences[Math.min(i, t.sentences.length - 1)]?.start ?? 0) * 30),
    e: (i) => voiceAt + Math.round((t?.sentences[Math.min(i, t.sentences.length - 1)]?.end ?? 0) * 30),
  };
};
