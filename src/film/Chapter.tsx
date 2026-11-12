import React from 'react';
import {AbsoluteFill, interpolate, Sequence, useCurrentFrame} from 'remotion';
import layout from '../data/layout.json';
import {SCENES} from '../scenes/registry';
import {makeSceneInfo, SceneCtx} from './context';
import {ChapterCard, enterStyle, TransitionOverlay, TxKind} from './Transitions';
import {Credits} from './Credits';

const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

const SceneShell: React.FC<{enter: TxKind | null; enterOverlap: number; isLast: boolean; isFirst: boolean; duration: number; children: React.ReactNode}> = ({
  enter,
  enterOverlap,
  isLast,
  isFirst,
  duration,
  children,
}) => {
  const f = useCurrentFrame();
  const fadeOut = isLast ? interpolate(f, [duration - 22, duration - 2], [1, 0], clamp) : 1;
  const fadeIn = isFirst ? interpolate(f, [0, 16], [0, 1], clamp) : 1;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      <AbsoluteFill style={{...enterStyle(enter, enterOverlap, f), opacity: (enterStyle(enter, enterOverlap, f).opacity as number ?? 1) * fadeOut * fadeIn}}>
        {children}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const Chapter: React.FC<{n: number}> = ({n}) => {
  const ch = layout.chapters[n - 1];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {ch.scenes.map((sc, i) => {
        const prev = i > 0 ? ch.scenes[i - 1] : null;
        const Comp = SCENES[sc.id];
        const info = makeSceneInfo(sc.id, sc.duration, sc.voiceAt);
        return (
          <Sequence key={sc.id} from={sc.from} durationInFrames={sc.duration} name={sc.id}>
            <SceneCtx.Provider value={info}>
              <SceneShell
                enter={prev ? (prev.outTransition as TxKind) : null}
                enterOverlap={prev ? prev.outOverlap : 0}
                isLast={i === ch.scenes.length - 1}
                isFirst={i === 0}
                duration={sc.duration}
              >
                {Comp ? <Comp /> : <AbsoluteFill style={{background: '#300'}} />}
              </SceneShell>
            </SceneCtx.Provider>
          </Sequence>
        );
      })}
      {ch.scenes.map((sc, i) =>
        i < ch.scenes.length - 1 && sc.outOverlap > 0 && (sc.outTransition === 'flash' || sc.outTransition === 'smoke' || sc.outTransition === 'wipe') ? (
          <Sequence key={'tx' + sc.id} from={sc.from + sc.duration - sc.outOverlap} durationInFrames={sc.outOverlap}>
            <TransitionOverlay kind={sc.outTransition as TxKind} overlap={sc.outOverlap} seed={i * 17 + n} />
          </Sequence>
        ) : null,
      )}
      {ch.credits ? (
        <Sequence from={ch.duration - ch.credits} durationInFrames={ch.credits}>
          <Credits duration={ch.credits} />
        </Sequence>
      ) : null}
      {n > 1 ? <ChapterCard n={n} title={ch.title} start={8} end={ch.scenes[0].voiceAt - 14} /> : null}
    </AbsoluteFill>
  );
};
