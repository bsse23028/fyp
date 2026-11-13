// TOUCH POINT - remembers where the child last touched the screen, so cartoon eyes can look there.
//   reportTouch(pageX, pageY)          call it from a screen's onTouchStart (it never blocks the touch)
//   const stop = onTouch((x, y) => ...)  listen; call stop() to stop listening

const listeners = new Set();

export function reportTouch(x, y) {
  listeners.forEach((listener) => listener(x, y));
}

export function onTouch(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
