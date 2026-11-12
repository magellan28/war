import React from 'react';
import {AbsoluteFill, interpolate, staticFile, useCurrentFrame} from 'remotion';

/** Animated film grain (pre-baked tiles, overlay blend). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.09}) => {
  const frame = useCurrentFrame();
  const i = frame % 6;
  const ox = (frame * 137) % 512;
  const oy = (frame * 251) % 512;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `url(${staticFile(`fx/grain${i}.png`)})`,
        backgroundPosition: `${ox}px ${oy}px`,
        mixBlendMode: 'overlay',
        opacity,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Lens vignette + subtle cool grade. */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.85}) => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(ellipse 75% 70% at 50% 55%, rgba(0,0,0,0) 45%, rgba(2,5,8,${strength}) 100%)`,
      pointerEvents: 'none',
    }}
  />
);

/** Tilt-shift depth of field: blur toward the horizon and foreground. */
export const DepthOfField: React.FC<{amount?: number; topStop?: number}> = ({amount = 6, topStop = 38}) => {
  if (amount <= 0.05) return null;
  const mask = `linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.6) ${topStop * 0.55}%, transparent ${topStop}%, transparent 82%, rgba(0,0,0,0.7) 100%)`;
  return (
    <AbsoluteFill
      style={{
        backdropFilter: `blur(${amount}px)`,
        WebkitBackdropFilter: `blur(${amount}px)`,
        maskImage: mask,
        WebkitMaskImage: mask,
        pointerEvents: 'none',
      }}
    />
  );
};

/** Atmospheric haze toward the horizon (sells the tilted plane). */
export const Haze: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <AbsoluteFill
    style={{
      background: 'linear-gradient(to bottom, rgba(14,26,34,0.92) 0%, rgba(14,26,34,0.45) 16%, rgba(14,26,34,0) 38%)',
      opacity,
      pointerEvents: 'none',
    }}
  />
);

/** Light-flash transition: hot core + bloom, peaking at `at`. */
export const Flash: React.FC<{at: number; color?: string}> = ({at, color = '255,236,200'}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [at - 6, at, at + 3, at + 22], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 50% 52%, rgba(255,255,255,${o}) 0%, rgba(${color},${o * 0.95}) 30%, rgba(${color},${o * 0.55}) 70%)`,
        mixBlendMode: 'screen',
        pointerEvents: 'none',
      }}
    />
  );
};

export const FadeFromBlack: React.FC<{start: number; dur: number; reverse?: boolean}> = ({start, dur, reverse}) => {
  const frame = useCurrentFrame();
  const o = interpolate(frame, [start, start + dur], reverse ? [0, 1] : [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  if (o <= 0) return null;
  return <AbsoluteFill style={{background: '#000', opacity: o}} />;
};
