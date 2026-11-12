import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import layout from '../data/layout.json';
import {Chapter} from './Chapter';

/** Whole film (preview). Final renders are made per chapter and concatenated. */
export const Film: React.FC = () => (
  <AbsoluteFill style={{background: '#000'}}>
    {layout.chapters.map((c) => (
      <Sequence key={c.n} from={c.filmFrom} durationInFrames={c.duration}>
        <Chapter n={c.n} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
