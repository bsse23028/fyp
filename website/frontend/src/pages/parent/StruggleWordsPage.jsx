// STRUGGLE WORDS - words a child found tricky while reading (from the server, most missed first),
// an empty state while there are none yet, 🔊 per word.

import { useEffect } from 'react';
import { useChild } from '../../context/ChildContext';
import { useLanguage } from '../../context/LanguageContext';
import { translate } from '../../i18n/translate';
import { Page, useCurrentChild } from '../../layouts/Layouts';
import { speak } from '../../services/audio';
import { Badge, Button, EmptyState, LoadError, PageHeader } from '../../components/ui';
import { ChildPicker } from '../../components/rows';

export default function StruggleWordsPage() {
  const { childProfiles, struggle, fetchStruggleWords } = useChild();
  useLanguage();
  const { currentId: childId, setCurrentId: setChildId } = useCurrentChild();
  const child = childProfiles.find((c) => c.id === childId) || childProfiles[0] || null;
  const shownId = child ? child.id : null;

  useEffect(() => {
    if (shownId) fetchStruggleWords(shownId);
  }, [shownId, fetchStruggleWords]);

  const entry = shownId ? struggle[shownId] : null;
  const hasWords = Boolean(entry && entry.words);
  const loading = shownId && !hasWords && (!entry || entry.status === 'loading');
  const failed = !hasWords && entry && entry.status === 'failed';
  const realWords = hasWords ? entry.words : [];
  const none = !loading && !failed && realWords.length === 0;
  const words = loading || failed ? [] : [...realWords].sort((a, b) => b.count - a.count);
  const max = Math.max(1, ...words.map((w) => w.count));

  return (
    <Page>
      <PageHeader title="Struggle words" subtitle="Words that came up again while reading. Practise them gently at home." />
      {!child ? (
        <div className="panel"><EmptyState mascot="rabbit" title="No child profiles yet" text="Add a child profile first. It takes about a minute." action={<Button to="/parent/children/new" icon="plus">Add a child</Button>} /></div>
      ) : (
        <>
          <ChildPicker list={childProfiles} value={child.id} onChange={setChildId} showAge />
          <section className="panel">
            <div className="panel-head">
              <h2>{translate('{name}’s words', { name: child.name })}</h2>
              {!loading && !failed && !none && <span className="small muted">{translate(words.length === 1 ? '{n} word' : '{n} words', { n: words.length })}</span>}
            </div>
            {loading && (
              <div className="list" aria-busy="true">
                {[0, 1, 2, 3].map((i) => <div key={i} className="list-row"><span className="skeleton" style={{ height: 18, width: `${40 + i * 10}%` }} /></div>)}
              </div>
            )}
            {failed && <div className="panel-pad"><LoadError message={entry.error} onRetry={() => fetchStruggleWords(shownId)} /></div>}
            {none && (
              <EmptyState icon="alphabetical-variant" title="No struggle words yet" text={translate('Words {name} finds hard while reading along appear here, so you can practise them gently at home.', { name: child.name })} />
            )}
            {!loading && !failed && !none && (
              <table className="table">
                <thead>
                  <tr>
                    <th>{translate('Word')}</th>
                    <th>{translate('Missed')}</th>
                    <th className="hide-sm">{translate('Topic')}</th>
                    <th><span className="sr-only">{translate('Say it')}</span></th>
                  </tr>
                </thead>
                <tbody>
                  {words.map((item) => (
                    <tr key={item.word}>
                      <td className="word-cell">{item.word}</td>
                      <td>
                        <span className="meter-cell">
                          <span className="meter"><span style={{ width: `${(item.count / max) * 100}%` }} /></span>
                          {item.count === 1 ? translate('Missed 1 time') : translate('Missed {n} times', { n: item.count })}
                        </span>
                      </td>
                      <td className="hide-sm">{item.topic ? <Badge tone="neutral">{translate(item.topic)}</Badge> : <span className="muted">-</span>}</td>
                      <td className="cell-end"><Button variant="secondary" icon="volume-high" onClick={() => speak(item.word)}>Say it</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>
        </>
      )}
    </Page>
  );
}
