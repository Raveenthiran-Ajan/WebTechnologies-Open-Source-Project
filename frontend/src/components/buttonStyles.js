import styled from 'styled-components';
import { Button } from '@mui/material';


const baseButton = `
  && {
    border-radius: 12px;
    font-weight: 600;
    letter-spacing: 0.5px;
    padding: 10px 24px;
    box-shadow: 0 2px 8px rgba(77, 181, 255, 0.08);
    transition: 
      background 0.2s, 
      color 0.2s, 
      box-shadow 0.2s, 
      transform 0.1s;
    margin-left: 4px;
    text-transform: none;
  }
`;

export const RedButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #ff5858 60%, #f26767 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #f26767 0%, #ff5858 100%);
      box-shadow: 0 4px 16px rgba(255, 88, 88, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const BlackButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #232526 60%, #414345 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #414345 0%, #232526 100%);
      box-shadow: 0 4px 16px rgba(35, 37, 38, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const DarkRedButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #650909 60%, #eb7979 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #eb7979 0%, #650909 100%);
      box-shadow: 0 4px 16px rgba(101, 9, 9, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const BlueButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #080a43 60%, #0a1e82 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #0a1e82 0%, #080a43 100%);
      box-shadow: 0 4px 16px rgba(8, 10, 67, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const PurpleButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #270843 60%, #3f1068 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #3f1068 0%, #270843 100%);
      box-shadow: 0 4px 16px rgba(39, 8, 67, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const LightPurpleButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #7f56da 60%, #7a1ccb 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #7a1ccb 0%, #7f56da 100%);
      box-shadow: 0 4px 16px rgba(127, 86, 218, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const GreenButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #133104 60%, #266810 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #266810 0%, #133104 100%);
      box-shadow: 0 4px 16px rgba(19, 49, 4, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const BrownButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #2c1006 60%, #40220c 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #40220c 0%, #2c1006 100%);
      box-shadow: 0 4px 16px rgba(44, 16, 6, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;

export const IndigoButton = styled(Button)`
  ${baseButton}
  && {
    background: linear-gradient(90deg, #2f2b80 60%, #534ea6 100%);
    color: #fff;
    &:hover {
      background: linear-gradient(90deg, #534ea6 0%, #2f2b80 100%);
      box-shadow: 0 4px 16px rgba(47, 43, 128, 0.15);
      transform: translateY(-2px) scale(1.03);
    }
  }
`;