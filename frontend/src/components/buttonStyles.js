import styled from 'styled-components';
import { Button } from '@mui/material';

// Neumorphic/Soft Modern Button Styles
const neumorphBase = `
  && {
    border-radius: 16px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 12px 28px;
    background: #f5f7fa;
    color: #22223b;
    box-shadow: 4px 4px 16px #e4e9f7, -4px -4px 16px #ffffff;
    border: none;
    margin-left: 4px;
    text-transform: none;
    transition: box-shadow 0.2s, background 0.2s, color 0.2s, transform 0.1s;
  }
`;

export const RedButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #ff5858;
    color: #fff;
    &:hover {
      background: #f26767;
      color: #fff;
      box-shadow: 0 6px 24px #ffb3b3;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const BlackButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #232526;
    color: #fff;
    &:hover {
      background: #414345;
      color: #fff;
      box-shadow: 0 6px 24px #bdbdbd;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const DarkRedButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #650909;
    color: #fff;
    &:hover {
      background: #eb7979;
      color: #fff;
      box-shadow: 0 6px 24px #f26767;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const BlueButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #080a43;
    color: #fff;
    &:hover {
      background: #0a1e82;
      color: #fff;
      box-shadow: 0 6px 24px #4db5ff;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const PurpleButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #270843;
    color: #fff;
    &:hover {
      background: #3f1068;
      color: #fff;
      box-shadow: 0 6px 24px #b39ddb;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #7f56da;
    color: #fff;
    &:hover {
      background: #7a1ccb;
      color: #fff;
      box-shadow: 0 6px 24px #d1b3ff;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const GreenButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #133104;
    color: #fff;
    &:hover {
      background: #266810;
      color: #fff;
      box-shadow: 0 6px 24px #b2f2bb;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const BrownButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #2c1006;
    color: #fff;
    &:hover {
      background: #40220c;
      color: #fff;
      box-shadow: 0 6px 24px #d7ccc8;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const IndigoButton = styled(Button)`
  ${neumorphBase}
  && {
    background: #2f2b80;
    color: #fff;
    &:hover {
      background: #534ea6;
      color: #fff;
      box-shadow: 0 6px 24px #b3b3ff;
      transform: translateY(-2px) scale(1.03);
    }
  }
`;