import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {KidoButaiApproach} from './KidoButaiApproach';

export const Prototype: React.FC<{withAudio?: boolean}> = ({withAudio = true}) => (
  <AbsoluteFill>
    <KidoButaiApproach />
    {withAudio ? <Audio src={staticFile('audio/proto_mix.wav')} /> : null}
  </AbsoluteFill>
);
