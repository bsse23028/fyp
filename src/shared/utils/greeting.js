// GREETING - picks "Good morning / afternoon / evening" from the phone's clock.
//
//   05:00 - 11:59  Good morning!   🌞
//   12:00 - 16:59  Good afternoon! ☀️
//   17:00 - 04:59  Good evening!   🌆  (🌙 after 8 pm)

export function getGreeting(date = new Date()) {
  const hour = date.getHours(); // 0 - 23, in the phone's own time zone

  if (hour >= 5 && hour < 12) return { text: 'Good morning!', emoji: '🌞' };
  if (hour >= 12 && hour < 17) return { text: 'Good afternoon!', emoji: '☀️' };
  if (hour >= 17 && hour < 20) return { text: 'Good evening!', emoji: '🌆' };
  return { text: 'Good evening!', emoji: '🌙' };
}
