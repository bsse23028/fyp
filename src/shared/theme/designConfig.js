// DESIGN CONFIG - the shapes and sizes of the KidBuddy "inspo" look (rebrand 2026-11-20):
// a big purple title with the buddy peeking next to it, a rounded pale-lilac SHEET under it,
// pastel TILES in a grid, white CARDS with a progress bar, small pill TAGS and a progress RING.
// Colours come from PALETTE in theme.js; only sizes live here. Sizes are in screen points.

export const DESIGN = {
  // ----- page title (PageTitle.js) -----
  EYEBROW_SIZE: 16, // the small line above the title ("Psst,", "Good morning, Sarah")
  TITLE_SIZE: 30, // the big purple title
  TITLE_LINE: 36, // line height of the title
  TITLE_MASCOT: 96, // height of the buddy peeking next to the title

  // ----- form screens (AuthHeading.js: log in, sign up, codes ...) -----
  AUTH_MASCOT: 110, // height of the buddy peeking in above the title

  // ----- welcome screen -----
  WELCOME_MASCOT: 0.22, // height of the buddy on the left of the Welcome text: a part of the screen height

  // ----- detail header (DetailHeader.js) -----
  DETAIL_MASCOT: 120, // height of the big buddy on a detail screen (Progress, Edit profile ...)

  // ----- sheet (Sheet.js) -----
  SHEET_RADIUS: 34, // rounded top corners of the pale sheet
  SHEET_PADDING: 18, // space inside the sheet
  SHEET_OVERLAP: 6, // how far the sheet moves up under the title area

  // ----- tiles (PastelTile.js, StatTile.js) -----
  TILE_RADIUS: 26, // rounded corners of a pastel tile
  TILE_MIN_HEIGHT: 118, // smallest height of a tile in the grid
  TILE_GAP: 12, // space between tiles
  TILE_ICON: 28, // size of the icon / emoji in a tile

  // ----- cards (ProgressCard.js) -----
  CARD_RADIUS: 22, // rounded corners of a white list card
  CARD_ICON_BOX: 50, // the square behind the icon on the left of a card
  BAR_HEIGHT: 8, // height of a progress bar

  // ----- pill tabs (SegmentedControl.js) + tags (Tag.js) -----
  PILL_HEIGHT: 44, // height of one pill tab (tap target together with its padding)
  TAG_HEIGHT: 28, // height of a small tag ("Hobby", "Goal")

  // ----- progress ring (ProgressRing.js) -----
  RING_SIZE: 190, // width of the ring
  RING_STROKE: 16, // thickness of the ring
  RING_SWEEP: 270, // how much of a full circle the ring draws (270 = open at the bottom, like the inspo)

  // ----- parent bottom bar (ParentTabBar.js) -----
  TAB_BAR_HEIGHT: 68, // height of the bar (without the phone's own bottom area)
  TAB_ICON: 24, // icon size in the bar
};
