// PIN MODAL - the "Parent check" pop-up (the app's PinModal). It guards the way OUT of Child Mode.
//
//   <PinModal onClose={...} onSuccess={...} />          ask for the PIN (or create one the first time)
//   <PinModal onClose={...} onSuccess={...} forceCreate />   always ask for a NEW pin (Settings)
//
//   no PIN yet   -> "Create a 4-digit PIN", then type it again
//   PIN exists   -> "Enter your 4-digit PIN" (the server locks it for 5 minutes after 5 wrong tries)
//   Forgot PIN?  -> the account password, then a new PIN
// Works with the mouse, touch, or the keyboard's number keys. The PIN is checked and stored
// (as a hash) by the shared API - never in the browser.

import { useCallback, useEffect, useRef, useState } from 'react';
import { Button, IconButton, TextField } from './ui';
import Icon from './Icon';
import { useAuth } from '../context/AuthContext';
import { translate } from '../i18n/translate';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'];

const TITLES = {
  enter: { title: 'Parent check', copy: 'Enter your 4-digit parent PIN' },
  create: { title: 'Create a parent PIN', copy: 'Choose 4 digits. You will need them to leave Child Mode.' },
  confirm: { title: 'Type it again', copy: 'Enter the same 4 digits to confirm.' },
  forgot: { title: 'Forgot your PIN?', copy: 'Type your account password to make a new PIN.' },
};

export default function PinModal({ onClose, onSuccess, forceCreate = false }) {
  const { pin, savePin, checkPin, checkPassword } = useAuth();
  const [phase, setPhase] = useState(pin && !forceCreate ? 'enter' : 'create');
  const [digits, setDigits] = useState('');
  const [firstPin, setFirstPin] = useState('');
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = useCallback(
    async (code) => {
      setBusy(true);
      try {
        if (phase === 'enter') {
          const result = await checkPin(code);
          if (result.valid) return onSuccess();
          setError(
            result.attemptsLeft > 0
              ? translate('That PIN is not right. {n} tries left.', { n: result.attemptsLeft })
              : 'That PIN is not right. Try again.'
          );
          setDigits('');
        } else if (phase === 'create') {
          setFirstPin(code);
          setDigits('');
          setPhase('confirm');
        } else if (phase === 'confirm') {
          if (code === firstPin) {
            await savePin(code);
            return onSuccess();
          }
          setError('The two PINs were different. Start again.');
          setDigits('');
          setPhase('create');
        }
      } catch (err) {
        setError(err.status === 404 ? 'No PIN yet. Create one in Settings.' : err.message);
        setDigits('');
      } finally {
        setBusy(false);
      }
    },
    [phase, firstPin, checkPin, savePin, onSuccess]
  );

  // The typed digits also live in a ref, so fast typing never reads an old value and the
  // 4th digit submits exactly ONCE.
  const typed = useRef('');
  typed.current = digits;
  const press = useCallback(
    (key) => {
      if (key === '' || busy) return;
      setError('');
      const current = typed.current;
      if (key === '⌫') {
        typed.current = current.slice(0, -1);
        setDigits(typed.current);
        return;
      }
      if (current.length >= 4) return;
      const next = current + key;
      typed.current = next;
      setDigits(next);
      if (next.length === 4) setTimeout(() => submit(next), 150);
    },
    [busy, submit]
  );

  useEffect(() => {
    if (phase === 'forgot') return undefined;
    const onKey = (event) => {
      if (/^\d$/.test(event.key)) press(event.key);
      else if (event.key === 'Backspace') press('⌫');
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [phase, press]);

  async function handlePassword(event) {
    event.preventDefault();
    try {
      if (await checkPassword(password)) {
        setPassword('');
        setError('');
        setPhase('create');
      } else setError('That password is not right.');
    } catch (err) {
      setError(err.message);
    }
  }

  const text = TITLES[phase];

  return (
    <div className="sheet-backdrop" role="presentation">
      <div className="bottom-sheet" role="dialog" aria-modal="true" aria-label={translate(text.title)}>
        <div className="pin-head">
          <span className="ico-tile"><Icon name="shield-lock-outline" size={22} /></span>
          <div>
            <h2 className="pin-title">{translate(text.title)}</h2>
            <p className="pin-copy">{translate(text.copy)}</p>
          </div>
          <IconButton icon="close" label="Cancel" onClick={onClose} className="pin-close" />
        </div>

        {phase === 'forgot' ? (
          <form onSubmit={handlePassword} style={{ marginTop: 24 }}>
            <TextField label="Account password" type="password" value={password} onChange={setPassword} placeholder="Your password" autoComplete="current-password" error={error} autoFocus />
            <Button type="submit" block style={{ marginTop: 16 }}>Continue</Button>
          </form>
        ) : (
          <>
            <div className="pin-dots" aria-label={translate('{n} of 4 digits typed', { n: digits.length })}>
              {[0, 1, 2, 3].map((i) => (
                <span key={i} className={i < digits.length ? 'on' : ''} />
              ))}
            </div>
            <p className="pin-error" role="alert">{error ? translate(error) : ''}</p>
            <div className="pin-pad">
              {KEYS.map((key, i) => (
                <button key={i} type="button" className={key === '' ? 'empty' : ''} onClick={() => press(key)} aria-label={key === '⌫' ? translate('Delete') : key} tabIndex={key === '' ? -1 : 0}>
                  {key === '⌫' ? <Icon name="arrow-left" size={22} style={{ margin: '0 auto' }} /> : key}
                </button>
              ))}
            </div>
            <div className="pin-foot">
              {phase === 'enter' ? (
                <button type="button" className="link" onClick={() => { setError(''); setPhase('forgot'); }}>
                  {translate('Forgot PIN?')}
                </button>
              ) : (
                <span className="small-print">{translate('You can type the digits on your keyboard too.')}</span>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
