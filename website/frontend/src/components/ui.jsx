// UI - the website's component library. Every page builds from these, so the whole site shares one
// look: Button, IconButton, TextField, FormError, FormNotice, PasswordStrength, OtpInput, Chip,
// SegmentedControl, Toggle, Badge, ProgressBar, Avatar, Mascot, BrandLogo, EmptyState, LoadError,
// Spinner, PageHeader, plus the child-mode pieces (SoftButton, BackButton, SpeakButton, StarRow,
// ChildInstruction). All visible text goes through translate() (English / اردو).

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { translate } from '../i18n/translate';
import { useLanguage } from '../context/LanguageContext';
import { useChild } from '../context/ChildContext';
import { getAvatar } from '../data/avatars';
import { passwordChecks } from '../utils/validation';
import { speakUi, speak } from '../services/audio';
import Icon from './Icon';

const tr = (value) => (typeof value === 'string' ? translate(value) : value);

// <T>Log In</T> -> translated text (re-renders when the language changes)
export function T({ children, params }) {
  useLanguage();
  return <>{translate(children, params)}</>;
}

export function Spinner({ big = false }) {
  return <span className={`spinner${big ? ' big' : ''}`} role="status" aria-label={translate('Loading')} />;
}

// variant: primary | secondary | ghost | danger | danger-solid    size: sm | md | lg
export function Button({ children, variant = 'primary', size, block = false, loading = false, icon, iconEnd, to, className = '', style, ...rest }) {
  const classes = `btn btn-${variant}${size && size !== 'md' ? ` btn-${size}` : ''}${block ? ' btn-block' : ''} ${className}`;
  const inside = loading ? (
    <Spinner />
  ) : (
    <>
      {icon && <Icon name={icon} size={18} />}
      {tr(children)}
      {iconEnd && <Icon name={iconEnd} size={18} className="ico flip-rtl" />}
    </>
  );
  if (to) {
    return (
      <Link to={to} className={classes} style={style} {...rest}>
        {inside}
      </Link>
    );
  }
  return (
    <button type="button" className={classes} style={style} disabled={loading || rest.disabled} aria-busy={loading || undefined} {...rest}>
      {inside}
    </button>
  );
}

export function IconButton({ icon, label, onClick, outlined = false, size = 20, className = '', ...rest }) {
  return (
    <button type="button" className={`icon-btn${outlined ? ' outlined' : ''} ${className}`} onClick={onClick} aria-label={translate(label)} title={translate(label)} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
}

let fieldCount = 0;
export function TextField({ label, error, hint, optional = false, type = 'text', value, onChange, multiline = false, className = '', style, inputRef, labelEnd, ...rest }) {
  const idRef = useRef(null);
  if (!idRef.current) idRef.current = `field-${++fieldCount}`;
  const id = idRef.current;
  const [shown, setShown] = useState(false);
  const secret = type === 'password';
  const Input = multiline ? 'textarea' : 'input';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={`field${error ? ' has-error' : ''} ${className}`} style={style}>
      {label && (
        <label className="field-label" htmlFor={id}>
          <span>{translate(label)}</span>
          {optional && <span className="opt">{translate('Optional')}</span>}
          {labelEnd}
        </label>
      )}
      <div className="field-control">
        <Input
          id={id}
          ref={inputRef}
          className={`field-input${secret ? ' with-toggle' : ''}`}
          type={secret && shown ? 'text' : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={describedBy}
          {...rest}
          placeholder={rest.placeholder ? translate(rest.placeholder) : undefined}
        />
        {secret && (
          <button type="button" className="field-toggle" onClick={() => setShown(!shown)} aria-label={translate(shown ? 'Hide password' : 'Show password')} title={translate(shown ? 'Hide password' : 'Show password')}>
            <Icon name={shown ? 'eye-off-outline' : 'eye-outline'} size={18} />
          </button>
        )}
      </div>
      {hint && !error && (
        <p className="field-hint" id={`${id}-hint`}>
          {translate(hint)}
        </p>
      )}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          <Icon name="alert-circle-outline" size={16} style={{ marginTop: 2 }} />
          {translate(error)}
        </p>
      )}
    </div>
  );
}

export function FormError({ message, style }) {
  if (!message) return null;
  return (
    <div className="form-error" role="alert" style={style}>
      <Icon name="alert-circle-outline" size={18} />
      <span>{translate(message)}</span>
    </div>
  );
}

export function FormNotice({ message, style }) {
  if (!message) return null;
  return (
    <div className="form-notice" role="status" style={style}>
      <Icon name="check-circle-outline" size={18} />
      <span>{translate(message)}</span>
    </div>
  );
}

// The password rules as small pills that turn green when met (the same rules as the app and the API).
const SHORT_RULE = { length: '8+ characters', upper: 'A capital (A-Z)', lower: 'A small letter (a-z)', number: 'A number', special: 'A symbol (! @ #)', space: 'No spaces' };
export function PasswordRules({ password, style }) {
  const checks = passwordChecks(password);
  return (
    <ul className="pw-rules" aria-label={translate('Password rules')} style={style}>
      {checks.map((rule) => (
        <li key={rule.id} className={rule.ok ? 'ok' : ''} title={translate(rule.label)}>
          <Icon name="check" size={13} />
          {translate(SHORT_RULE[rule.id] || rule.label)}
          <span className="sr-only">{translate(rule.ok ? 'done' : 'not yet')}</span>
        </li>
      ))}
    </ul>
  );
}

// ONE real input drawn as six boxes: typing, paste and the browser's one-time-code autofill all work.
export function OtpInput({ value, onChange, autoFocus = true, error = false, style }) {
  const ref = useRef(null);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (autoFocus && ref.current) ref.current.focus();
  }, [autoFocus]);
  const active = Math.min(value.length, 5);
  return (
    <div className={`otp${error ? ' error' : ''}`} style={style}>
      <input
        ref={ref}
        className="otp-input"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]*"
        maxLength={6}
        value={value}
        aria-label={translate('6-digit code')}
        aria-invalid={error || undefined}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`otp-box${focused && i === active ? ' active' : ''}${value[i] ? ' filled' : ''}`} aria-hidden="true">
          {value[i] || ''}
        </span>
      ))}
    </div>
  );
}

export function Chip({ label, selected, onClick, translateLabel = true, icon }) {
  return (
    <button type="button" className={`chip${selected ? ' selected' : ''}`} aria-pressed={selected} onClick={onClick}>
      {selected && <Icon name="check" size={16} />}
      {!selected && icon && <Icon name={icon} size={16} />}
      {translateLabel ? translate(label) : label}
    </button>
  );
}

export function SegmentedControl({ options, value, onChange, label, block = false }) {
  return (
    <div className={`segmented${block ? ' block' : ''}`} role="radiogroup" aria-label={label ? translate(label) : undefined}>
      {options.map((option) => (
        <button key={option.id} type="button" role="radio" aria-checked={value === option.id} className={value === option.id ? 'on' : ''} onClick={() => onChange(option.id)}>
          {translate(option.label)}
        </button>
      ))}
    </div>
  );
}

export function Toggle({ on, onClick, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label ? translate(label) : undefined} className={`toggle${on ? ' on' : ''}`} onClick={onClick} />;
}

export function Badge({ children, tone = '', icon }) {
  return (
    <span className={`badge ${tone}`}>
      {icon && <Icon name={icon} size={14} />}
      {tr(children)}
    </span>
  );
}

export function ProgressBar({ value = 0, color, label }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100);
  return (
    <div className="progress-track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label={label ? translate(label) : undefined}>
      <span style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// With no `avatar`, the buddy of the child in Child Mode is drawn (the bunny everywhere else).
export function Mascot({ avatar, size = 80, bob = false, className = '', alt, style }) {
  const { displayAvatar } = useChild();
  const item = getAvatar(avatar || displayAvatar);
  return (
    <img
      className={`mascot${bob ? ' bob' : ''} ${className}`}
      src={item.mascot}
      alt={alt === undefined ? translate('{name} buddy', { name: translate(item.name) }) : alt}
      style={{ height: size, width: size * item.ratio, ...style }}
      draggable={false}
    />
  );
}

// A child's buddy in a soft round frame (lists, headers, the picker).
export function Avatar({ avatar, size = 40, alt = '' }) {
  const item = getAvatar(avatar);
  return (
    <span className="avatar" style={{ width: size, height: size, background: item.color }}>
      <img src={item.mascot} alt={alt} draggable={false} />
    </span>
  );
}

export function BrandLogo({ avatar, height = 32 }) {
  const { displayAvatar } = useChild();
  const item = getAvatar(avatar || displayAvatar);
  return <img className="mascot" src={item.logo} alt="KidBuddy" style={{ height, width: height * item.logoRatio }} draggable={false} />;
}

// The page title row of Parent Mode: title + one line of context on the left, actions on the right.
export function PageHeader({ title, subtitle, params, actions, children }) {
  return (
    <header className="page-header">
      <div className="ph-text">
        {children}
        <h1>{translate(title, params)}</h1>
        {subtitle && <p>{tr(subtitle)}</p>}
      </div>
      {actions && <div className="ph-actions">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon = 'compass-outline', mascot, title, text, action }) {
  return (
    <div className="empty">
      {mascot ? <Mascot avatar={mascot} size={110} alt="" /> : <span className="ico-tile" style={{ width: 56, height: 56 }}><Icon name={icon} size={28} /></span>}
      <h3>{translate(title)}</h3>
      {text && <p>{translate(text)}</p>}
      {action}
    </div>
  );
}

export function LoadError({ title = 'Could not connect', message, onRetry }) {
  return (
    <div className="load-error" role="alert">
      <Icon name="alert-circle-outline" size={24} color="var(--danger)" />
      <h3>{translate(title)}</h3>
      {message && <p>{translate(message)}</p>}
      {onRetry && (
        <Button variant="secondary" size="sm" icon="refresh" onClick={onRetry} style={{ marginTop: 6 }}>
          Try again
        </Button>
      )}
    </div>
  );
}

/* ---------- child-mode pieces ---------- */

// The big rounded kid button: primary | secondary | soft
export function SoftButton({ children, variant = 'primary', icon, onClick, to, style, className = '', loading = false, type = 'button' }) {
  const inside = loading ? (
    <Spinner />
  ) : (
    <>
      {icon && <span className="emoji" aria-hidden="true">{icon}</span>}
      <span>{tr(children)}</span>
    </>
  );
  if (to) {
    return (
      <Link to={to} className={`soft-btn ${variant} ${className}`} style={style}>
        {inside}
      </Link>
    );
  }
  return (
    <button type={type} className={`soft-btn ${variant} ${className}`} style={style} onClick={onClick}>
      {inside}
    </button>
  );
}

export function BackButton({ onClick, style }) {
  return (
    <button type="button" className="back-btn" onClick={onClick} aria-label={translate('Go back')} style={style}>
      <Icon name="arrow-left" size={26} className="ico flip-rtl" />
    </button>
  );
}

export function SpeakButton({ text, onClick, english = false, compact = false, style, label = 'Read aloud' }) {
  return (
    <button
      type="button"
      className={`speak-btn${compact ? ' compact' : ''}`}
      aria-label={translate(label)}
      title={translate(label)}
      style={style}
      onClick={() => {
        if (onClick) onClick();
        else if (english) speak(text);
        else speakUi(text);
      }}
    >
      <Icon name="volume-high" size={compact ? 20 : 26} />
    </button>
  );
}

export function StarRow({ filled = 0, total = 3, size = 40 }) {
  return (
    <div className="star-row" aria-label={translate('{n} of {total} stars', { n: filled, total })}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ fontSize: size, color: i < filled ? 'var(--sun)' : 'var(--line-strong)' }} aria-hidden="true">
          ★
        </span>
      ))}
    </div>
  );
}

export function ChildInstruction({ text, tint, style }) {
  return (
    <div className="child-instruction" style={{ background: tint, ...style }}>
      <span>{translate(text)}</span>
    </div>
  );
}
