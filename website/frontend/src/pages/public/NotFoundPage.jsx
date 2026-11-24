// NOT FOUND - a calm page for a link that does not exist.

import { Mascot, Button, T } from '../../components/ui';
import TracingLetters from '../../components/TracingLetters';

export default function NotFoundPage() {
  return (
    <div className="center-screen notfound">
      <div className="state-card">
        <Mascot size={130} avatar="rabbit" bob alt="" />
        <h1 className="title-xl"><T>Page not found</T></h1>
        <p className="muted"><T>This page does not exist. Let’s go back home.</T></p>
        <Button to="/">Go home</Button>
      </div>
      <div className="notfound-art" aria-hidden="true"><TracingLetters /></div>
    </div>
  );
}
