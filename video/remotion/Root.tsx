import React from 'react';
import {Composition} from 'remotion';
import {CampusCareShowcase, showcaseDurationInFrames} from './CampusCareShowcase';

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CampusCareShowcase"
    component={CampusCareShowcase}
    durationInFrames={showcaseDurationInFrames}
    fps={30}
    width={1920}
    height={1080}
  />
);
