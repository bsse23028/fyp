// NOT FOUND - a calm page for a link that does not exist, in the same layout as Welcome and Log in.

import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { Button } from '../../components/ui';
import EntryShell, { PanelArt } from '../../components/EntryShell';

export default function NotFoundPage() {
  useLanguage();
  return (
    <EntryShell theme={0} scene={<PanelArt />}>
      <h1>{translate('Page not found')}</h1>
      <p className="es-sub">{translate('This page does not exist. Let’s go back home.')}</p>
      <div className="es-stack">
        <Button size="lg" to="/">Go home</Button>
      </div>
    </EntryShell>
  );
}
