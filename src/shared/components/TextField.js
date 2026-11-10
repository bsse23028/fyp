// // TEXT FIELD - a label, a rounded input box, and (when needed) an error.
// // The border turns indigo with a soft glow while the box is focused.
// //
// //   <TextField
// //     label="Email address"
// //     value={email}
// //     onChangeText={setEmail}
// //     error={emailError}        // '' = no error
// //   />
// //
// // Any other TextInput prop (keyboardType, secureTextEntry, placeholder ...)
// // can be passed and goes straight to the input. `inputRef` lets a screen
// // move the cursor to this field (used for the "next" key on the keyboard).

// import React, { useState } from 'react';
// import { StyleSheet, TextInput, View } from 'react-native';
// import Text from './AppText';
// import { useLanguage } from '../../app/context/LanguageContext';
// import { COLORS, FONTS, RADIUS, SIZES } from '../theme/theme';

// export default function TextField({ label, error, inputRef, onFocus, onBlur, style, ...inputProps }) {
//   const [focused, setFocused] = useState(false);
//   const { t } = useLanguage(); // translates the placeholder

//   // Border colour: red if there is an error, indigo if focused, otherwise grey.
//   const borderColor = error ? COLORS.error : focused ? COLORS.primary : COLORS.border;

//   return (
//     <View style={style}>
//       <Text style={styles.label}>{label}</Text>

//       {/* the ring is the soft glow around a focused input */}
//       <View style={[styles.ring, focused && !error && styles.ringFocused]}>
//         <TextInput
//           ref={inputRef}
//           {...inputProps}
//           placeholder={inputProps.placeholder ? t(inputProps.placeholder) : undefined}
//           accessibilityLabel={label}
//           placeholderTextColor={COLORS.textMuted}
//           style={[styles.input, inputProps.multiline ? styles.multiline : styles.singleLine, { borderColor }]}
//           onFocus={(e) => {
//             setFocused(true);
//             if (onFocus) onFocus(e);
//           }}
//           onBlur={(e) => {
//             setFocused(false);
//             if (onBlur) onBlur(e);
//           }}
//         />
//       </View>

//       {error ? (
//         <Text style={styles.error} accessibilityLiveRegion="polite">
//           {error}
//         </Text>
//       ) : null}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   label: {
//     marginBottom: 6,
//     fontFamily: FONTS.interSemiBold,
//     fontSize: 13,
//     color: COLORS.text,
//   },
//   // React Native has no CSS "spread" shadow, so the glow is a padded box.
//   // The negative margin cancels the padding so nothing shifts when it appears.
//   ring: {
//     padding: 3,
//     margin: -3,
//     borderRadius: RADIUS.input,
//   },
//   ringFocused: {
//     backgroundColor: 'rgba(227, 227, 239, 0.14)',
//   },
//   singleLine: {
//     height: SIZES.input,
//   },
//   // a taller box for longer notes (add `multiline` to the TextField)
//   multiline: {
//     minHeight: 110,
//     paddingTop: 12,
//     paddingBottom: 12,
//     textAlignVertical: 'top',
//   },
//   input: {
//     borderRadius: RADIUS.input,
//     borderWidth: 1.5,
//     backgroundColor: COLORS.white,
//     paddingHorizontal: 14,
//     fontFamily: FONTS.interRegular,
//     fontSize: 14,
//     color: COLORS.text,
//   },
//   error: {
//     marginTop: 8,
//     fontFamily: FONTS.interRegular,
//     fontSize: 12,
//     color: COLORS.error,
//   },
// });
// TEXT FIELD - a label, a rounded input box, and (when needed) an error.
// The border turns indigo with a soft glow while the box is focused.
//
//   <TextField
//     label="Email address"
//     value={email}
//     onChangeText={setEmail}
//     error={emailError}        // '' = no error
//   />
//
// PASSWORD / PIN BOXES: add `secureTextEntry` and a "Show" / "Hide" button appears
// inside the box automatically (no extra code in the screen).
//
// Any other TextInput prop (keyboardType, placeholder ...)
// can be passed and goes straight to the input. `inputRef` lets a screen
// move the cursor to this field (used for the "next" key on the keyboard).

import React, { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import Text from './AppText';
import { useLanguage } from '../../app/context/LanguageContext';
import { COLORS, FONTS, RADIUS, SIZES } from '../theme/theme';

export default function TextField({ label, error, inputRef, onFocus, onBlur, style, ...inputProps }) {
  const [focused, setFocused] = useState(false);
  const [shown, setShown] = useState(false); // password / PIN visible?
  const isSecret = !!inputProps.secureTextEntry; // true for password and PIN boxes
  const { t } = useLanguage(); // translates the placeholder

  // Border colour: red if there is an error, indigo if focused, otherwise grey.
  const borderColor = error ? COLORS.error : focused ? COLORS.primary : COLORS.border;

  return (
    <View style={style}>
      <Text style={styles.label}>{label}</Text>

      {/* the ring is the soft glow around a focused input */}
      <View style={[styles.ring, focused && !error && styles.ringFocused]}>
        <TextInput
          ref={inputRef}
          {...inputProps}
          secureTextEntry={isSecret && !shown}
          placeholder={inputProps.placeholder ? t(inputProps.placeholder) : undefined}
          accessibilityLabel={label}
          placeholderTextColor={COLORS.textMuted}
          style={[
            styles.input,
            inputProps.multiline ? styles.multiline : styles.singleLine,
            isSecret && styles.inputWithButton,
            { borderColor },
          ]}
          onFocus={(e) => {
            setFocused(true);
            if (onFocus) onFocus(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            if (onBlur) onBlur(e);
          }}
        />

        {/* the Show / Hide button sits inside the right end of the box */}
        {isSecret ? (
          <Pressable
            onPress={() => setShown(!shown)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={shown ? 'Hide' : 'Show'}
            style={styles.toggle}
          >
            <Text style={styles.toggleText}>{shown ? 'Hide' : 'Show'}</Text>
          </Pressable>
        ) : null}
      </View>

      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    marginBottom: 6,
    fontFamily: FONTS.interSemiBold,
    fontSize: 13,
    color: COLORS.text,
  },
  // React Native has no CSS "spread" shadow, so the glow is a padded box.
  // The negative margin cancels the padding so nothing shifts when it appears.
  ring: {
    padding: 3,
    margin: -3,
    borderRadius: RADIUS.input + 3,
  },
  ringFocused: {
    backgroundColor: '#FFFF',
  },
  // room on the right so typed text never runs under the Show / Hide button
  inputWithButton: {
    paddingEnd: 64,
  },
  toggle: {
    position: 'absolute',
    end: 14,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  toggleText: {
    fontFamily: FONTS.interBold,
    fontSize: 13,
    color: COLORS.primary,
  },
  singleLine: {
    height: SIZES.input,
  },
  // a taller box for longer notes (add `multiline` to the TextField)
  multiline: {
    minHeight: 110,
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top',
  },
  input: {
    borderRadius: RADIUS.input,
    borderWidth: 1.5,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    fontFamily: FONTS.interRegular,
    fontSize: 14,
    color: COLORS.text,
  },
  error: {
    marginTop: 8,
    fontFamily: FONTS.interRegular,
    fontSize: 12,
    color: COLORS.error,
  },
});