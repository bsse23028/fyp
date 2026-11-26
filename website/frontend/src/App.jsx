// APP - every page of the website and who may open it (the web version of the app's AppNavigator).
//
//   /                      landing (Splash + Welcome of the app)       public
//   /onboarding            the intro (3 steps)                        public
//   /login /signup /verify-email /forgot-password /reset-code /reset-password   logged OUT only
//   /permissions /children/new                                         logged in
//   /parent/...            Parent Mode (Home, Plan, Progress, Settings, account, child profiles)
//   /who                   "Who is learning?" (enter Child Mode)
//   /child/...             Child Mode (Child Home, a group page, My Buddy, Reading & Writing (English), Talk (AAC board))
//
// Guards: a page for logged-in parents sends visitors to Log In; while a child is in Child Mode
// every Parent Mode page sends them back to /child (the only way out is the 🔒 Parent PIN).

import { lazy, Suspense, useEffect } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useChild } from './context/ChildContext';
import { useLanguage } from './context/LanguageContext';
import { AuthLayout, ChildLayout, EntryLayout, ParentLayout, SetupLayout } from './layouts/Layouts';
import { LoadError, Spinner } from './components/ui';
import { BootScreen } from './components/EntryShell';
import { translate } from './i18n/translate';
import { parentStartPath } from './utils/start';

import LandingPage from './pages/public/LandingPage';
import OnboardingPage from './pages/public/OnboardingPage';
import LoginPage from './pages/auth/LoginPage';
import SignUpPage from './pages/auth/SignUpPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetCodePage from './pages/auth/ResetCodePage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import NotFoundPage from './pages/public/NotFoundPage';

// Logged-in pages are loaded on demand, so the landing page stays small.
const PermissionsPage = lazy(() => import('./pages/parent/PermissionsPage'));
const CreateChildPage = lazy(() => import('./pages/parent/CreateChildPage'));
const ParentHomePage = lazy(() => import('./pages/parent/ParentHomePage'));
const ParentPlanPage = lazy(() => import('./pages/parent/ParentPlanPage'));
const ParentProgressPage = lazy(() => import('./pages/parent/ParentProgressPage'));
const ParentSettingsPage = lazy(() => import('./pages/parent/ParentSettingsPage'));
const AccountPage = lazy(() => import('./pages/parent/AccountPage'));
const ChangePasswordPage = lazy(() => import('./pages/parent/ChangePasswordPage'));
const UpdatePinPage = lazy(() => import('./pages/parent/UpdatePinPage'));
const EditProfilePage = lazy(() => import('./pages/parent/EditProfilePage'));
const EditSectionPage = lazy(() => import('./pages/parent/EditSectionPage'));
const PersonalizeStoriesPage = lazy(() => import('./pages/parent/PersonalizeStoriesPage'));
const StruggleWordsPage = lazy(() => import('./pages/parent/StruggleWordsPage'));
const ChildrenPage = lazy(() => import('./pages/parent/ChildrenPage'));
const ChildSetupPage = lazy(() => import('./pages/parent/ChildSetupPage'));
const ProfilePickerPage = lazy(() => import('./pages/child/ProfilePickerPage'));
const ChildHomePage = lazy(() => import('./pages/child/ChildHomePage'));
const MyBuddyPage = lazy(() => import('./pages/child/MyBuddyPage'));
const EnglishRoutes = lazy(() => import('./pages/english/EnglishRoutes'));
const LearningGroupPage = lazy(() => import('./pages/child/LearningGroupPage'));
const TalkBoardPage = lazy(() => import('./pages/talk/TalkBoardPage'));

function FullScreenSpinner() {
  return (
    <div className="center-screen">
      <Spinner big />
    </div>
  );
}

// Waits for the saved login check; shows Retry when the server cannot be reached.
function SessionGate({ children }) {
  const { loading, startupError, retryRestoreSession } = useAuth();
  if (startupError) return <BootScreen error={startupError} onRetry={retryRestoreSession} />;
  if (loading) return <BootScreen />;
  return children;
}

// The browser tab says which page you are on ("Log in · KidBuddy", "Zara · Activities · KidBuddy"): before the account exists
// and in Parent Mode. Child Mode keeps plain "KidBuddy".
const PAGE_TITLES = {
  '/': 'Welcome',
  '/onboarding': 'Get started',
  '/login': 'Log in',
  '/signup': 'Create account',
  '/verify-email': 'Verify your email',
  '/forgot-password': 'Forgot password',
  '/reset-code': 'Enter your code',
  '/reset-password': 'New password',
  '/permissions': 'Permissions',
  '/children/new': 'Add a child',
  '/who': 'Who’s playing?',
  '/parent': 'Dashboard',
  '/parent/children': 'My Children',
  '/parent/children/new': 'Add a child',
  '/parent/plan': 'Plan',
  '/parent/struggle-words': 'Struggle words',
  '/parent/progress': 'Progress',
  '/parent/settings': 'Settings',
  '/parent/account': 'My account',
  '/parent/account/password': 'Change password',
  '/parent/pin': 'Update PIN',
};
const PROFILE_PARTS = { basics: 'Basics', support: 'Areas of support', modules: 'Activities', stories: 'Stories', setup: 'Set up' };
const APP_PATHS = ['/parent', '/child', '/who', '/start', '/permissions', '/children', '/welcome'];
function PageTitle() {
  const { pathname } = useLocation();
  const { childProfiles } = useChild();
  useEffect(() => {
    const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    let title = PAGE_TITLES[path] ? translate(PAGE_TITLES[path]) : null;
    const profile = path.match(/^\/parent\/children\/([^/]+)(?:\/([^/]+))?$/);
    if (!title && profile) {
      const child = childProfiles.find((c) => c.id === profile[1]);
      const part = PROFILE_PARTS[profile[2]];
      title = child ? (part ? `${child.name} · ${translate(part)}` : child.name) : translate('Child profile');
    }
    if (!title && !APP_PATHS.some((p) => path === p || path.startsWith(p + '/'))) title = translate('Page not found');
    document.title = title ? `${title} · KidBuddy` : 'KidBuddy';
  });
  return null;
}

function RequireGuest() {
  const { user } = useAuth();
  const { childMode } = useChild();
  if (user) return <Navigate to={childMode ? '/child' : '/start'} replace />;
  return <Outlet />;
}

// Where a parent lands right after logging in / verifying: Parent Home, or the first-child steps.
function StartRedirect() {
  const { childProfiles, childMode } = useChild();
  if (childMode) return <Navigate to="/child" replace />;
  return <Navigate to={parentStartPath(childProfiles)} replace />;
}

// allowPreview: Explore KidBuddy works BEFORE signing up (the intro's "Try KidBuddy first"): the demo child needs no account.
function RequireAuth({ allowPreview = false }) {
  const { user } = useAuth();
  const { loading, error, loadChildren, isPreview } = useChild();
  const location = useLocation();
  if (!user && allowPreview && isPreview) {
    return (
      <Suspense fallback={<FullScreenSpinner />}>
        <Outlet />
      </Suspense>
    );
  }
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (error && loading) {
    return (
      <div className="center-screen">
        <LoadError message={error} onRetry={() => loadChildren().catch(() => {})} />
      </div>
    );
  }
  if (loading) return <FullScreenSpinner />;
  return (
    <Suspense fallback={<FullScreenSpinner />}>
      <Outlet />
    </Suspense>
  );
}

function ParentOnly() {
  const { childMode } = useChild();
  if (childMode) return <Navigate to="/child" replace />;
  return <Outlet />;
}

function ChildOnly() {
  const { childMode, activeChild } = useChild();
  if (!childMode || !activeChild) return <Navigate to="/parent" replace />;
  return <Outlet />;
}

export default function App() {
  // Subscribing here re-renders every page (keeping its state) when English / اردو is switched.
  useLanguage();
  return (
    <SessionGate>
      <PageTitle />
      <Routes>
        <Route element={<EntryLayout />}>
          <Route index element={<LandingPage />} />
          <Route path="onboarding" element={<OnboardingPage />} />
        </Route>
        <Route path="welcome" element={<Navigate to="/" replace />} />
        <Route element={<RequireGuest />}>
          <Route element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-code" element={<ResetCodePage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
          </Route>
        </Route>

        <Route element={<RequireAuth />}>
          <Route path="start" element={<StartRedirect />} />
          <Route element={<ParentOnly />}>
            <Route element={<SetupLayout />}>
              <Route path="permissions" element={<PermissionsPage />} />
              <Route path="children/new" element={<CreateChildPage />} />
              <Route path="who" element={<ProfilePickerPage />} />
            </Route>
            <Route path="parent" element={<ParentLayout />}>
              <Route index element={<ParentHomePage />} />
              <Route path="plan" element={<ParentPlanPage />} />
              <Route path="progress" element={<ParentProgressPage />} />
              <Route path="settings" element={<ParentSettingsPage />} />
              <Route path="account" element={<AccountPage />} />
              <Route path="account/password" element={<ChangePasswordPage />} />
              <Route path="pin" element={<UpdatePinPage />} />
              <Route path="children" element={<ChildrenPage />} />
              <Route path="children/new" element={<CreateChildPage embedded />} />
              <Route path="children/:childId" element={<EditProfilePage />} />
              <Route path="children/:childId/setup" element={<ChildSetupPage />} />
              <Route path="children/:childId/stories" element={<PersonalizeStoriesPage />} />
              <Route path="children/:childId/:section" element={<EditSectionPage />} />
              <Route path="struggle-words" element={<StruggleWordsPage />} />
            </Route>
          </Route>
        </Route>

        {/* Child Mode: for a logged-in parent, or for Explore KidBuddy before signing up (allowPreview) */}
        <Route element={<RequireAuth allowPreview />}>
          <Route element={<ChildOnly />}>
            <Route path="child" element={<ChildLayout />}>
              <Route index element={<ChildHomePage />} />
              <Route path="buddy" element={<MyBuddyPage />} />
              <Route path="group/:groupId" element={<LearningGroupPage />} />
              <Route path="talk" element={<TalkBoardPage />} />
              <Route path="english/*" element={<EnglishRoutes />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SessionGate>
  );
}
