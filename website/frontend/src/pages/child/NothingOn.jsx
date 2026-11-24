// NOTHING ON - shown in Child Mode when the parent has switched off every activity for this part.

import { translate } from '../../i18n/translate';
import { Mascot } from '../../components/ui';

export default function NothingOn() {
  return (
    <div className="nothing-on" role="status">
      <Mascot avatar="rabbit" size={120} alt="" />
      <p className="nothing-on-title">{translate('Nothing to play here yet')}</p>
      <p className="nothing-on-text">{translate('Ask a grown-up to switch on activities in Parent Mode.')}</p>
    </div>
  );
}
