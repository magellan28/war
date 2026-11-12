import React from 'react';
import {Composition} from 'remotion';
import {loadFonts} from './fonts';
import {Prototype} from './scenes/proto/Prototype';
import {FPS} from './theme';

loadFonts();

// Authored at 1920x1080. Final 4K (3840x2160) is rendered with --scale=2,
// so every vector, label and line is re-rasterised at full UHD resolution.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Prototype" component={Prototype} durationInFrames={750} fps={FPS} width={1920} height={1080} />
  </>
);
