import React from 'react';
import * as A from './ch1_2';
import * as B from './ch3_4';
import * as Cc from './ch5_6';
import * as D from './ch7_8_9';

const all: Record<string, unknown> = {...A, ...B, ...Cc, ...D};

/** scene id (c4s7) -> component (C4S7) */
export const SCENES: Record<string, React.FC> = Object.fromEntries(
  Object.entries(all)
    .filter(([k]) => /^C\dS\d+$/.test(k))
    .map(([k, v]) => [k.toLowerCase(), v as React.FC]),
);
