import colors from './color-preset';

// Primary
const alpha = {
  alphaLighter: colors.indigo[100],
  alphaLight: colors.indigo[300],
  alpha: colors.indigo[500],
  alphaDark: colors.indigo[600],
  alphaDarker: colors.indigo[800],
};

// Secondary
const beta = {
  betaLighter: colors.purple[100],
  betaLight: colors.purple[300],
  beta: colors.purple[500],
  betaDark: colors.purple[600],
  betaDarker: colors.purple[800],
};

// Reserved
const gamma = {};

// Reserved
const psi = {};

// Neutral
const omega = {
  omegaLighter: colors.blueGray[200],
  omegaLight: colors.blueGray[300],
  omega: colors.blueGray[500],
  omegaDark: colors.blueGray[600],
  omegaDarker: colors.blueGray[800],
};

export default {
  text: colors.blueGray[600],
  article: colors.blueGray[700],
  heading: colors.blueGray[800],

  ...alpha,
  ...beta,
  ...gamma,
  ...psi,
  ...omega,

  successLight: colors.green[100],
  success: colors.green[500],
  errorLight: colors.red[100],
  error: colors.red[500],

  white: colors.white,
  background: `#f8f8f8`,
  contentBg: colors.white,
  headerBg: `transparent`,
  headerActiveBg: colors.white,
  headerActiveColor: omega.omegaDarker,
  footerBg: colors.white,

  mute: colors.blueGray[300],
  highlight: colors.blueGray[200],
};
