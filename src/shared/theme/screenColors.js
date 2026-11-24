// SCREEN COLOURS - which background (and top bar) colour every screen of the app gets.
//
// The rules (from the KidBuddy palette, see PALETTE in theme.js):
//   - ONE calm, LIGHT background per screen (never a dark one)
//   - Lavender Mist = the main background (most screens)
//   - Blush Peach   = log in / "welcome back" screens, and reward screens
//   - Soft Pink     = the top bar of DETAIL screens (one child's progress, a profile ...)
//   - the top bar (logo + buttons) has the same colour as the page, so the screen looks like one piece,
//     except on detail screens, where it is Soft Pink like the header of the "Reading" screen in the inspo.
//
// HOW TO CHANGE A SCREEN: find its name below (the name used in AppNavigator.js or modules/english/index.js)
// and change its colour. A screen that is not listed gets DEFAULT_SCREEN.
// Screens with an animated sky (KidScene) draw their own background; only their top bar colour is used,
// and it matches the top of their sky so the bar and the sky meet without a line.
// A screen can still pass <Screen background={...}>, which wins over this list.

import { PALETTE } from './theme';

const MAIN = { page: PALETTE.lavenderMist, header: PALETTE.lavenderMist };
const WELCOME_BACK = { page: PALETTE.blushPeach, header: PALETTE.blushPeach };
const DETAIL = { page: PALETTE.lavenderMist, header: PALETTE.softPink };
// detail screens with a DetailHeader: the whole top is Soft Pink, the content sits on a pale Sheet
const PINK_DETAIL = { page: PALETTE.softPink, header: PALETTE.softPink };

// the tops of the KidScene skies (shared/components/kidSceneConfig.js)
const SKY_DAY = { page: PALETTE.lavenderMist, header: '#EBDDF8' };
const SKY_LESSON = { page: PALETTE.lavenderMist, header: PALETTE.lavenderMist };
const SKY_SPELLING = { page: PALETTE.blushPeach, header: PALETTE.blushPeach };
const SKY_SUNSET = { page: PALETTE.softPink, header: PALETTE.softPink };

export const DEFAULT_SCREEN = MAIN;

export const SCREEN_COLORS = {
  // ----- first screens -----
  Splash: MAIN,
  Welcome: MAIN,
  Onboarding: MAIN,

  // ----- account: sign up (main colour) and log in / "welcome back" (peach) -----
  SignUp: MAIN,
  EmailVerification: MAIN,
  LogIn: MAIN, // same as Welcome (the user asked), with the same soft bubbles
  ForgotPassword: MAIN, // like Log In (lavender + bubbles)
  PasswordOtp: MAIN,
  ResetPassword: MAIN,
  Permissions: MAIN,
  CreateChildProfile: MAIN,
  ChildSetup: MAIN,

  // ----- parent mode -----
  ParentHome: MAIN,
  ParentPlan: MAIN,
  ParentSettings: MAIN,
  ParentProgress: PINK_DETAIL,
  EditProfile: PINK_DETAIL,
  EditChildSection: DETAIL,
  PersonalizeStories: DETAIL,
  ParentProfile: PINK_DETAIL,
  ChangePassword: DETAIL,
  UpdatePin: DETAIL,
  StruggleWords: DETAIL,

  // ----- child mode -----
  ProfilePicker: WELCOME_BACK, // "who is learning today?" = a welcome back screen
  ChildHome: MAIN,
  LearningGroup: MAIN, // a Child Home group page (its modules, "Coming soon" when not built)
  EditAvatar: MAIN,

  // ----- English module (these have an animated sky) -----
  EnglishHub: MAIN, // inspo look: flat page + sheet (no animated sky)
  AlphabetList: SKY_DAY,
  LetterLesson: SKY_LESSON,
  TraceList: SKY_DAY,
  LetterTrace: SKY_DAY,
  EnglishActivities: MAIN, // the activities of proposal Module 3 or 4
  BubblePopGame: SKY_DAY,
  MatchPairsGame: SKY_DAY,
  StoryList: SKY_DAY,
  LetterStory: SKY_DAY,
  ReadingTopics: SKY_DAY,
  ReadingLevel: SKY_DAY,
  ReadingAlong: SKY_LESSON,
  ReadingYourTurn: SKY_LESSON,
  ReadingSummary: SKY_LESSON,
  SpellingWords: SKY_SUNSET,
  SpellingGame: SKY_SPELLING,

  // ----- Talk module -----
  AACBoard: MAIN, // calm, plain page: the pictures must stand out
};

// The colours of one screen: { page, header }.
export function screenColorsFor(routeName) {
  return SCREEN_COLORS[routeName] || DEFAULT_SCREEN;
}
