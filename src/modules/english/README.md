# English module (Read Along)

Everything about the English / Words activities lives in THIS folder.
**When you want changes to this module, send only this folder** (plus this README) - nothing else is needed.

```
english/
  index.js            what the module contains (name, Redux slice, screens, Urdu words)
  readingData.js      small helpers for the topics file (LEVELS, findSentences, getSentence)
  data/               readingTopics.json (topics x easy/medium/hard) · sampleStruggleWords.json
  store/              englishSlice.js  (Redux Toolkit: picked topic + level, struggle words, custom topics)
  i18n/ur.json        Urdu words used only by this module
  screens/            WordsHub · ReadingTopics · ReadingLevel · ReadingAlong · ReadingYourTurn
                      ReadingSummary · StruggleWords (Parent -> Plan)
```

## Flow
Child Home (English) -> **WordsHub** -> Read Along -> **ReadingTopics** -> **ReadingLevel** ->
**ReadingAlong** <-> **ReadingYourTurn** (one pair per sentence) -> **ReadingSummary**.
Parent: Plan -> Struggle words -> **StruggleWords**.

## What this module may import from the rest of the app
Paths are written from `src/modules/english/screens/` (one folder less for files in the module root).

| Need | Import |
|---|---|
| Text with Urdu support | `import Text from '../../../shared/components/AppText'` |
| Screen wrapper (`scroll`, `mode="child"` or `"parent"`) | `shared/components/Screen` |
| Child screen header / instruction bar | `shared/components/ChildHeader`, `ChildInstruction` |
| Other components | `shared/components/` BackButton · SpeakButton · Mascot · StarRow · Chip · Button · TextField ... |
| Colours, fonts | `import { COLORS, FONTS } from '../../../shared/theme/theme'` |
| Save / load on the phone | `shared/utils/storage` (`saveData`, `loadData`) |
| Pop-ups, microphone | `shared/utils/alerts` (`showComingSoon`) · `shared/utils/permissions` (`ensureMicrophone`) |
| Active child, stars, children list | `import { useChild } from '../../../app/store/useChild'` |
| Language (`language`, `t()`) | `import { useLanguage } from '../../../app/context/LanguageContext'` |
| Logged-in parent | `import { useAuth } from '../../../app/context/AuthContext'` |
| Go to Child Home / Parent Home | `app/navigation/helpers` (`goToChildHome`, `goToParentHome`) |

Never import from another module. If two modules need the same thing, it moves to `shared/`.

## Plugging the module in
`src/modules/index.js` lists the modules. This one is registered with `import english from './english'`.
Screen names are global in the app, so give a new module's screens unique names (`NumbersHub`, not `Hub`).

## Things to know
- Sentence format, topic format and the "add a topic" steps are described at the top of `readingData.js`.
- Redux: `useSelector((state) => state.english)`; actions: `topicChosen`, `levelChosen`, `reportStruggleWord`, `saveCustomTopic`.
- The Parent Plan screen (`src/screens/parent/ParentPlanScreen.js`) opens `StruggleWords` by its screen name.
- The Urdu sentences were written by Claude - please have a native speaker review them.
