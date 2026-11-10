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
