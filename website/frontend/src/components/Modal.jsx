// MODAL - a calm pop-up over the page. Closes with Escape or a click outside.
//   <Modal title="Parent check" onClose={...}>...</Modal>
// On phones it slides up from the bottom (sheetOnMobile).

import { useEffect, useRef } from 'react';
import { translate } from '../i18n/translate';

export default function Modal({ title, onClose, children, role = 'dialog', sheetOnMobile = false, closeOnBackdrop = true }) {
  const boxRef = useRef(null);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape' && onClose) onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.activeElement;
    const box = boxRef.current;
    if (box && !box.contains(document.activeElement)) box.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      if (previous && previous.focus) previous.focus();
    };
  }, [onClose]);

  return (
    <div
      className={`modal-backdrop${sheetOnMobile ? ' sheet-on-mobile' : ''}`}
      onMouseDown={(event) => {
        if (closeOnBackdrop && event.target === event.currentTarget && onClose) onClose();
      }}
    >
      <div className="modal" role={role} aria-modal="true" aria-label={title ? translate(title) : undefined} tabIndex={-1} ref={boxRef}>
        {title && <h2 className="modal-title">{translate(title)}</h2>}
        {children}
      </div>
    </div>
  );
}
