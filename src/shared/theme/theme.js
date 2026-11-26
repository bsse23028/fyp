// THEME - the design "tokens" of the whole app (colours, fonts, sizes, spacing).
//
// Every colour / size used in a screen comes from here, so if you want to
// change the look of the app you change it in ONE place.
//
// COLOURS: the KidBuddy palette (rebrand 2026-11-20) is PALETTE below. Every other colour token
// (COLORS, CALM, GLASS ...) points at a PALETTE colour, so to change e.g. the purple everywhere,
// change PALETTE.purple only. Backgrounds are ALWAYS light (never a dark page).

// ---------- THE KIDBUDDY PALETTE ----------
export const PALETTE = {
  // Backgrounds (light only)
  lavenderMist: '#F3E6FA', // the main app background
  blushPeach: '#FADCD3', // second background: login / welcome back / reward screens
  softPink: '#F7D4D6', // the header area of detail screens
  cloudWhite: '#FFFFFF', // cards, list items, input fields
  paleLilac: '#FAF5FD', // card backgrounds, bars

  // Brand
  purple: '#8A33CF', // KidBuddy Purple: headings, icons, active things, outlined buttons, progress rings
  purpleLight: '#A866E0', // pressed states, secondary icons
  deepPurple: '#4A1D96', // the "Get Started" button on Welcome (white text on it is very easy to read)

  // Buttons and accents
  coral: '#FF7F7F', // main buttons (big text)
  coralDeep: '#E85A64', // pressed button; buttons with small white text (easier to read)
  mint: '#9ED9CF', // decorative shapes, "add new" cards, success
  sunny: '#F7C744', // progress bars, stars, rewards
  tangerine: '#F08A4B', // small highlights: badges

  // Pastel tiles (no more than 2-3 in view at once)
  pastelPink: '#F9D3D0', // Reading / Stories
  pastelYellow: '#FBEBA5', // Games
  pastelLilac: '#DDD0F5', // Art / Creativity
  pastelGreen: '#CDEBB8', // Learning
  pastelMint: '#CDEDE7', // Calm
  pastelBlue: '#CFE3F7', // Music / Extra

  // Text
  deepPlum: '#3D1F5C', // main body text
  mutedPlum: '#7A6890', // hints, captions, placeholders
  white: '#FFFFFF', // text on coral or purple

  // Not in the palette list, but needed: darker shades for TEXT in a colour (pastel / coral text is
  // too light to read), and the fur colours of the mascots for strong accents.
  mintDeep: '#2F7F73', // success text (readable mint)
  coralText: '#B4424D', // coral-ish text / error text (readable)
  blue: '#8EC1EC', // the puppy's blue
  green: '#A9DB8E', // the dino's green
};

// The main (filled) buttons of the whole app: Deep Purple with white text (the user's choice, 2026-11-21;
// they were Coral Deep before). Change `fill` here to recolour every main button at once.
export const BUTTON = {
  fill: PALETTE.deepPurple,
  pressed: PALETTE.purple, // the colour while the finger is on it
  text: PALETTE.white,
};

// ---------- COLOURS ----------
export const COLORS = {
  background: PALETTE.lavenderMist, // the page background of every screen

  // Brand / parent side (forms, buttons, links)
  primary: PALETTE.purple, // links, focused borders, outlined buttons
  primaryPale: PALETTE.pastelLilac, // info box
  heading: PALETTE.purple, // big screen titles ("Welcome back", "Create your account" ...)
  text: PALETTE.deepPlum, // labels and body text on forms
  textMuted: PALETTE.mutedPlum, // subtitles, hints, small print
  border: PALETTE.pastelLilac, // input borders
  white: PALETTE.cloudWhite, // cards, inputs, the header

  error: PALETTE.coralText, // error messages (a soft but readable red)
  success: PALETTE.mintDeep, // "code sent" message

  // Child side (welcome + onboarding screens)
  warmText: PALETTE.deepPlum, // titles
  warmMuted: PALETTE.mutedPlum, // soft copy

  // Mascot speech bubble
  bubble: PALETTE.purple, // purple bubble with white text
  bubbleAccent: PALETTE.sunny, // highlighted word

  // Onboarding card backgrounds
  cardBlue: PALETTE.pastelBlue,
  cardYellow: PALETTE.pastelYellow,
  cardGreen: PALETTE.pastelGreen,

  // Child side (activities): strong colour + matching pale colour
  blue: PALETTE.blue,
  bluePale: PALETTE.pastelBlue,
  sage: PALETTE.green,
  sagePale: PALETTE.pastelGreen,
  coral: PALETTE.coral,
  coralPale: PALETTE.pastelPink,
  yellow: PALETTE.sunny,
  yellowPale: PALETTE.pastelYellow,
  purple: PALETTE.purpleLight,
  purplePale: PALETTE.pastelLilac,
  orange: PALETTE.tangerine,
  orangePale: PALETTE.blushPeach,
  warmBorder: PALETTE.pastelLilac, // inactive dots / empty stars
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
  button: 20, // rounder, like the inspo buttons
  input: 18, // rounder, like the inspo text boxes
  card: 28,
  box: 14,
};

// ---------- SIZES ----------
export const SIZES = {
  button: 54, // height of every big button
  input: 52, // height of every text input
  otpBox: 50, // height of one OTP digit box
};

// ---------- CALM DESIGN (new look: Splash, Welcome, Parent Home, Preview) ----------
// Soft, predictable colours for autistic children and their parents. The old tokens above stay
// for every screen that has not been redesigned yet.
export const CALM = {
  background: PALETTE.lavenderMist,
  surface: PALETTE.cloudWhite,
  surfaceSoft: PALETTE.paleLilac,
  line: PALETTE.pastelLilac,

  primary: PALETTE.purple, // the brand colour (arrows, progress, outlines)
  primaryDark: PALETTE.purple, // purple text on light backgrounds (readable)
  primaryPale: PALETTE.pastelLilac,
  sky: PALETTE.blue,
  skyPale: PALETTE.pastelBlue,
  coral: PALETTE.coral,
  coralPale: PALETTE.pastelPink,
  yellow: PALETTE.sunny,
  yellowPale: PALETTE.pastelYellow,
  sage: PALETTE.green,
  sagePale: PALETTE.pastelGreen,
  lavender: PALETTE.purpleLight,
  lavenderPale: PALETTE.pastelLilac,

  heading: PALETTE.purple, // big screen titles
  text: PALETTE.deepPlum, // main text
  textSoft: PALETTE.mutedPlum, // secondary text
  onPrimary: PALETTE.white,
  backdrop: 'rgba(61, 31, 92, 0.32)', // deep plum, see-through (behind pop-ups)
};

// Soft accent families (pale card + strong colour + readable deep text colour), used in turn by the alphabet letters.
export const CALM_ACCENTS = [
  { pale: PALETTE.pastelMint, main: PALETTE.mint, deep: PALETTE.mintDeep },
  { pale: PALETTE.pastelBlue, main: PALETTE.blue, deep: '#2E6A8A' },
  { pale: PALETTE.pastelPink, main: PALETTE.coral, deep: PALETTE.coralText },
  { pale: PALETTE.pastelYellow, main: PALETTE.sunny, deep: '#86650F' },
  { pale: PALETTE.pastelGreen, main: PALETTE.green, deep: '#4A7448' },
  { pale: PALETTE.pastelLilac, main: PALETTE.purpleLight, deep: PALETTE.purple },
];

// Category colours (the pastel tiles of the palette), for subject / activity tiles:
//   pale = the tile, main = a stronger edge or disc, deep = readable text in that colour.
// Keep at most 2-3 different ones in view at once where you can (calm screens).
export const CATEGORY = {
  reading: { pale: PALETTE.pastelPink, main: PALETTE.coral, deep: PALETTE.coralText }, // Reading / Stories
  games: { pale: PALETTE.pastelYellow, main: PALETTE.sunny, deep: '#86650F' }, // Games
  art: { pale: PALETTE.pastelLilac, main: PALETTE.purpleLight, deep: PALETTE.purple }, // Art / Creativity / Talk
  learning: { pale: PALETTE.pastelGreen, main: PALETTE.green, deep: '#4A7448' }, // Learning
  calm: { pale: PALETTE.pastelMint, main: PALETTE.mint, deep: PALETTE.mintDeep }, // Calm / Breathing / Feelings
  music: { pale: PALETTE.pastelBlue, main: PALETTE.blue, deep: '#2E6A8A' }, // Music / Sounds / Extra
};

// A tile that is not built yet ("Coming soon"): quiet grey-lilac, faded icon, soft words.
export const SOON = {
  tile: '#EFEBF3',
  icon: PALETTE.mutedPlum,
  text: PALETTE.mutedPlum,
  iconOpacity: 0.5, // 1 = full colour, 0 = invisible
};

// Soft "yes" glow (mint, never harsh).
export const CALM_SUCCESS = { pale: PALETTE.pastelMint, main: PALETTE.mint, deep: PALETTE.mintDeep };

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
    shadowColor: PALETTE.deepPlum,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  lifted: {
    shadowColor: PALETTE.deepPlum,
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 5,
  },
};

// ---------- GLASS (the Child Home look) ----------
// A see-through white layer with a thin light border and a soft shadow, on a soft gradient.
export const GLASS = {
  gradient: [PALETTE.lavenderMist, PALETTE.paleLilac], // the page background, from top to bottom (one calm colour)
  fill: 'rgba(255, 255, 255, 0.55)', // the glass layer (about 55 percent white)
  fillStrong: 'rgba(255, 255, 255, 0.78)', // a more solid glass for small things with text on them
  border: 'rgba(255, 255, 255, 0.85)', // the thin light edge
  borderWidth: 1.5,
  star: PALETTE.sunny, // the star of the stars chip
  radius: 24, // rounded corners of glass cards and bubbles
  radiusLarge: 32, // the quick-start bar
  radiusPill: 999, // chips
  shadow: {
    shadowColor: PALETTE.deepPlum,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 0, // Android draws a hard grey edge under see-through views, so the glass has no elevation there
  },
};
