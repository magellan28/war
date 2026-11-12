import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './fonts';
import {Prototype} from './scenes/proto/Prototype';
import {Chapter} from './film/Chapter';
import {Film} from './film/Film';
import layout from './data/layout.json';
import {FPS} from './theme';

loadFonts();

// Authored at 1920x1080. The 4K UHD master (3840x2160) is rendered with
// --scale=2, so every vector, label and line is re-rasterised at full UHD.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Film" component={Film} durationInFrames={layout.duration} fps={FPS} width={1920} height={1080} />
    {layout.chapters.map((c) => (
      <Composition key={c.n} id={`Chapter${c.n}`} component={() => <Chapter n={c.n} />} durationInFrames={c.duration} fps={FPS} width={1920} height={1080} />
    ))}
    <Composition id="Prototype" component={Prototype} durationInFrames={750} fps={FPS} width={1920} height={1080} />
  </>
);
