# Lottie celebration files

Put these four files in THIS folder (exactly these names):

| File | Used for |
|---|---|
| `confetti.json` | the big celebration on the Result page |
| `party-popper.json` | small wins (Say finished, every Play round) |
| `stars.json` | added on the Result page, together with the confetti |
| `balloons.json` | not used yet (ready for later) |

## Where to get them
1. Go to **LottieFiles.com** and search, for example, "confetti", "party popper", "stars", "balloons".
2. Pick a FREE animation that is soft and gentle (no flashing, no fast spinning).
3. Download it as **Lottie JSON** (not .lottie, not GIF) and rename it to the name above.
4. **Check the licence of every file** on its LottieFiles page (most free ones use the Lottie Simple License,
   but read it, and give credit if it asks for it).

## Switch a file on
After you add a file, open `src/shared/components/lottieFiles.js` and remove the `//` in front of its line,
for example:

```js
confetti: require('../../../assets/lottie/confetti.json'),
```

Then restart Expo (`npx expo start -c`). If a file is missing or its line stays commented out, the app
simply uses its own built-in confetti instead, so nothing breaks.
