// FORM PIECES - the bigger inputs of the child-profile and story forms: AvatarPicker (buddy cards),
// ChoiceField (pick chips + "add your own"), ColorChoice (colour swatches), CodeStep (email code) and
// OptionsGate (waits for the server's choice lists).

import { useState } from 'react';
import { translate } from '../i18n/translate';
import { useChild } from '../context/ChildContext';
import { useAuth } from '../context/AuthContext';
import { Button, Chip, FormError, FormNotice, LoadError, OtpInput, Spinner } from './ui';
import Icon from './Icon';

// Waits for the server's choice lists (GET /api/options: age bands, languages, buddies, areas of support,
// activities, relations) before a form is shown, so a form never offers choices the server would refuse.
// Preview mode uses the built-in lists.
export function OptionsGate({ children }) {
  const { optionsStatus, loadOptions, isPreview } = useChild();
  if (isPreview || optionsStatus === 'ready') return children;
  if (optionsStatus === 'failed') return <LoadError title="Could not load the choices" message="Check your connection and try again." onRetry={loadOptions} />;
  return (
    <div className="center-text" style={{ padding: 40 }}>
      <Spinner big />
    </div>
  );
}

// The buddies the server allows, as selectable cards.
export function AvatarPicker({ selectedId, onSelect }) {
  const { options } = useChild();
  return (
    <div className="buddy-picker" role="radiogroup" aria-label={translate('Choose an avatar')}>
      {options.avatars.map((avatar) => {
        const on = avatar.id === selectedId;
        return (
          <button key={avatar.id} type="button" role="radio" aria-checked={on} className={`buddy-option${on ? ' on' : ''}`} onClick={() => onSelect(avatar.id)}>
            <span className="bo-art" style={{ background: avatar.color }}>
              <img src={avatar.mascot} alt="" style={{ height: 64, width: 64 * avatar.ratio }} draggable={false} />
            </span>
            <span className="bo-name">{translate(avatar.name)}</span>
            {on && <Icon name="check-circle" size={20} className="ico bo-check" />}
          </button>
        );
      })}
    </div>
  );
}

export function ChoiceField({ label, hint, options, value, onChange, multiple = false, otherPlaceholder = 'Type your own' }) {
  const [other, setOther] = useState('');
  const chosen = multiple ? value || [] : value ? [value] : [];
  const custom = chosen.filter((item) => !options.includes(item));

  function toggle(item) {
    if (multiple) onChange(chosen.includes(item) ? chosen.filter((x) => x !== item) : [...chosen, item]);
    else onChange(value === item ? '' : item);
  }

  function addOther() {
    const text = other.trim();
    if (!text) return;
    if (multiple) {
      if (!chosen.includes(text)) onChange([...chosen, text]);
    } else onChange(text);
    setOther('');
  }

  return (
    <fieldset className="choice-field">
      <legend className="field-label">
        <span>{translate(label)}</span>
        {hint && <span className="opt">{translate(hint)}</span>}
      </legend>
      <div className="chip-row">
        {[...options, ...custom].map((item) => (
          <Chip key={item} label={item} selected={chosen.includes(item)} onClick={() => toggle(item)} />
        ))}
      </div>
      <div className="choice-other">
        <input
          className="field-input"
          value={other}
          maxLength={100}
          onChange={(event) => setOther(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              event.preventDefault();
              addOther();
            }
          }}
          placeholder={translate(otherPlaceholder)}
          aria-label={translate(otherPlaceholder)}
        />
        <Button variant="secondary" icon="plus" onClick={addOther} disabled={!other.trim()}>Add</Button>
      </div>
    </fieldset>
  );
}

export function ColorChoice({ label, colours, value, onChange }) {
  return (
    <fieldset className="choice-field">
      <legend className="field-label">
        <span>{translate(label)}</span>
        {value && <span className="opt">{translate(value)}</span>}
      </legend>
      <div className="swatches" role="radiogroup">
        {colours.map((colour) => {
          const on = value === colour.name;
          return (
            <button
              key={colour.name}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={translate(colour.name)}
              title={translate(colour.name)}
              className={`swatch${on ? ' on' : ''}`}
              style={{ background: colour.hex, color: colour.name === 'White' || colour.name === 'Yellow' ? 'var(--ink)' : '#fff' }}
              onClick={() => onChange(on ? '' : colour.name)}
            >
              {on && <Icon name="check" size={18} />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

// "Enter the 6-digit code sent to …" (change password).
export function CodeStep({ email, buttonLabel, onVerify, onCancel, purpose }) {
  const { resendCode } = useAuth();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleVerify(event) {
    event.preventDefault();
    if (code.length < 6) return setError('Enter the 6-digit code.');
    setLoading(true);
    try {
      await onVerify(code);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleResend() {
    setCode('');
    setError('');
    try {
      await resendCode(email, purpose);
      setNotice('A new code has been sent.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <form onSubmit={handleVerify} className="form-stack">
      <p className="muted">{translate('Enter the 6-digit code sent to {email}.', { email })}</p>
      <OtpInput value={code} onChange={(v) => { setCode(v); setError(''); setNotice(''); }} error={Boolean(error)} />
      <FormError message={error} />
      {!error && <FormNotice message={notice} />}
      <div className="form-actions">
        <Button variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={loading}>{buttonLabel}</Button>
      </div>
      <p className="small muted">
        {translate('Didn’t receive it?')}{' '}
        <button type="button" className="link" onClick={handleResend}>{translate('Resend code')}</button>
      </p>
    </form>
  );
}
