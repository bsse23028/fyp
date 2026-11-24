// UI CONTEXT - pop-ups and notifications for the website (the web version of the app's Alert.alert).
//
//   const { toast, confirm, alert } = useUI();
//   toast('Saved', 'success')                       a small message in the corner for a few seconds
//   if (await confirm({ title, message, confirmLabel, danger: true })) ...   Yes / Cancel pop-up
//   await alert({ title, message })                 one OK button
//
// All text is translated.

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { translate } from '../i18n/translate';
import Modal from '../components/Modal';
import Icon from '../components/Icon';

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const nextId = useRef(1);

  const toast = useCallback((message, kind = 'info') => {
    const id = nextId.current++;
    setToasts((list) => [...list, { id, message, kind }]);
    setTimeout(() => setToasts((list) => list.filter((item) => item.id !== id)), 4200);
  }, []);

  const confirm = useCallback(
    (options) =>
      new Promise((resolve) => {
        setDialog({ ...options, kind: 'confirm', resolve });
      }),
    []
  );

  const alert = useCallback(
    (options) =>
      new Promise((resolve) => {
        setDialog({ ...options, kind: 'alert', resolve });
      }),
    []
  );

  function close(answer) {
    if (dialog) dialog.resolve(answer);
    setDialog(null);
  }

  return (
    <UIContext.Provider value={{ toast, confirm, alert }}>
      {children}

      <div className="toasts" role="status" aria-live="polite">
        {toasts.map((item) => (
          <div key={item.id} className={`toast ${item.kind}`}>
            <Icon name={item.kind === 'error' ? 'alert-circle-outline' : item.kind === 'success' ? 'check-circle-outline' : 'information-outline'} size={18} />
            <span>{translate(item.message)}</span>
          </div>
        ))}
      </div>

      {dialog && (
        <Modal title={dialog.title} onClose={() => close(false)} role="alertdialog">
          {dialog.message && <p>{translate(dialog.message, dialog.params)}</p>}
          <div className="modal-actions">
            {dialog.kind === 'confirm' && (
              <button type="button" className="btn btn-secondary" onClick={() => close(false)}>
                {translate(dialog.cancelLabel || 'Cancel')}
              </button>
            )}
            <AutoFocusButton className={`btn ${dialog.danger ? 'btn-danger-solid' : 'btn-primary'}`} onClick={() => close(true)} label={translate(dialog.confirmLabel || 'OK')} />
          </div>
        </Modal>
      )}
    </UIContext.Provider>
  );
}

function AutoFocusButton({ className, onClick, label }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, []);
  return (
    <button ref={ref} type="button" className={className} onClick={onClick}>
      {label}
    </button>
  );
}

export function useUI() {
  return useContext(UIContext);
}
