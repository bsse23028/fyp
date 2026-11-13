// THEME - the design "tokens" of the whole app (colours, fonts, sizes, spacing).
//
// Every colour / size used in a screen comes from here, so if you want to
// change the look of the app you change it in ONE place.
// The values were taken from the Figma design.

// ---------- COLOURS ----------
export const COLORS = {
  // Brand / parent side (forms, buttons, links)
  primary: '#4F46E5', // indigo - buttons, links, focused borders
  primaryPale: '#EEF2FF', // very light indigo - info box
  text: '#1E293B', // dark blue-grey - titles and labels on forms
  textMuted: '#64748B', // grey - subtitles, hints, small print
  border: '#E2E8F0', // light grey - input borders
  // white: '#c8ece4',
    white: '#FFFF',

  error: '#B42318', // red - error messages
  success: '#0D9488', // teal - "code sent" message

  // Child side (welcome + onboarding screens: warm brown text)
  warmText: '#3D2B1F', // dark brown titles
  warmMuted: '#9C7E6E', // soft brown copy

  // Mascot speech bubble
  bubble: '#1B1E3D', // dark navy bubble
  bubbleAccent: '#A99BF0', // lavender highlighted word

  // Onboarding card backgrounds
  cardBlue: '#D9EFF7',
  cardYellow: '#FAF0C0',
  cardGreen: '#D2E9CC',

  // Child side (activities): strong colour + matching pale colour
  blue: '#72BFDA',
  bluePale: '#D9EFF7',
  sage: '#82AA82',
  sagePale: '#D2E9CC',
  coral: '#D98C7E',
  coralPale: '#F5DAD5',
  yellow: '#E8C660',
  yellowPale: '#FAF0C0',
  purple: '#9E8BC8',
  purplePale: '#E2DCF5',
  orange: '#E8A054',
  orangePale: '#FAE4CA',
  warmBorder: '#E2D5C8', // inactive dots / empty stars
};

// ---------- FONTS ----------
// These names must match the keys loaded in src/shared/theme/fonts.js.
// IMPORTANT: when you use one of these, do NOT also set fontWeight.
export const FONTS = {
  // Nunito = friendly, rounded (welcome + onboarding)
  nunitoSemiBold: 'Nunito_600SemiBold',
  nunitoExtraBold: 'Nunito_800ExtraBold',
  nunitoBlack: 'Nunito_900Black',
  // Inter = clean (forms, buttons, small print)
  interRegular: 'Inter_400Regular',
  interMedium: 'Inter_500Medium',
  interSemiBold: 'Inter_600SemiBold',
  interBold: 'Inter_700Bold',
};

// ---------- FONT SIZES ----------
export const FONT_SIZES = {
  tiny: 11,
  small: 12,
  body: 14,
  button: 15,
  copy: 15,
  heading: 25, // "Welcome back", "Create your account" ...
  onboardingTitle: 26,
  welcomeTitle: 25,
};

// ---------- SPACING ----------
export const SPACING = {
  screen: 24, // left / right padding of every screen
  small: 8,
  medium: 16,
  large: 24,
  section: 32,
};

// ---------- SHAPES ----------
export const RADIUS = {
  button: 14,
  input: 12,
  card: 28,
  box: 14,
};

// ---------- SIZES ----------
export const SIZES = {
  button: 52, // height of every big button
  input: 50, // height of every text input
  otpBox: 50, // height of one OTP digit box
};

// ---------- CALM DESIGN (new look: Splash, Welcome, Parent Home, Preview) ----------
// Soft, predictable colours for autistic children and their parents. The old tokens above stay
// for every screen that has not been redesigned yet.
export const CALM = {
  background: '#FBF8F3', // warm off-white
  surface: '#FFFFFF',
  surfaceSoft: '#F4EFE8',
  line: '#ECE4DA',

  primary: '#4FA3A5', // soft teal
  primaryDark: '#2F7476', // teal text on light backgrounds (high contrast)
  primaryPale: '#E2F1F1',
  sky: '#8CC7E3',
  skyPale: '#E3F2FA',
  coral: '#EFA48B',
  coralPale: '#FCE7DF',
  yellow: '#F3CF6B',
  yellowPale: '#FDF3D6',
  sage: '#9CC59A',
  sagePale: '#E5F1E3',
  lavender: '#B9AEE0',
  lavenderPale: '#ECE8F8',

  text: '#2E2A26', // near-black warm text
  textSoft: '#6B625A', // secondary text (still AA on the background)
  onPrimary: '#FFFFFF',
  backdrop: 'rgba(46, 42, 38, 0.32)',
};

// Soft accent families (pale card + readable deep text colour), used in turn by the alphabet letters.
export const CALM_ACCENTS = [
  { pale: '#E2F1F1', main: '#4FA3A5', deep: '#2F7476' },
  { pale: '#E3F2FA', main: '#8CC7E3', deep: '#2E6A8A' },
  { pale: '#FCE7DF', main: '#EFA48B', deep: '#9A5338' },
  { pale: '#FDF3D6', main: '#F3CF6B', deep: '#86650F' },
  { pale: '#E5F1E3', main: '#9CC59A', deep: '#4A7448' },
  { pale: '#ECE8F8', main: '#B9AEE0', deep: '#5E50A0' },
];

// Soft "yes" glow (green-ish, never harsh).
export const CALM_SUCCESS = { pale: '#E3F4E6', main: '#8FCB9B', deep: '#3F7A4B' };

export const CALM_RADIUS = {
  small: 14,
  medium: 20,
  large: 24,
  xl: 28,
  pill: 999,
};

export const CALM_SPACING = {
  xs: 4,
  s: 8,
  m: 12,
  l: 16,
  xl: 20,
  xxl: 28,
  screen: 20,
};

export const CALM_SIZES = {
  tap: 56, // smallest tap target
  bigButton: 60,
};

export const CALM_SHADOW = {
  soft: {
    shadowColor: '#6B4E2E',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  lifted: {
    shadowColor: '#6B4E2E',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
};
