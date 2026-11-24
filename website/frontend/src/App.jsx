// APP - every page of the website and who may open it (the web version of the app's AppNavigator).
//
//   /                      landing (Splash + Welcome of the app)       public
//   /onboarding            the intro (3 steps)                        public
//   /login /signup /verify-email /forgot-password /reset-code /reset-password   logged OUT only
//   /permissions /children/new                                         logged in
//   /parent/...            Parent Mode (Home, Plan, Progress, Settings, account, child profiles)
//   /who                   "Who is learning?" (enter Child Mode)
//   /child/...             Child Mode (Child Home, My Buddy, the English module)
//
// Guards: a page for logged-in parents sends visitors to Log In; while a child is in Child Mode
// every Parent Mode page sends them back to /child (the only way out is the 🔒 Parent PIN).

import { lazy, Suspense } from 'react';
import { Navigate, Outlet, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useChild } from './context/ChildContext';
import { useLanguage } from './context/LanguageContext';
import { AuthLayout, ChildLayout, EntryLayout, ParentLayout, SetupLayout } from './layouts/Layouts';
import { LoadError, Spinner } from './components/ui';
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
const ProfilePickerPage = lazy(() => import('./pages/child/ProfilePickerPage'));
const ChildHomePage = lazy(() => import('./pages/child/ChildHomePage'));
const MyBuddyPage = lazy(() => import('./pages/child/MyBuddyPage'));
const EnglishRoutes = lazy(() => import('./pages/english/EnglishRoutes'));

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
  if (startupError) {
    return (
      <div className="center-screen">
        <LoadError message={startupError} onRetry={retryRestoreSession} />
      </div>
    );
  }
  if (loading) return <FullScreenSpinner />;
  return children;
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

function RequireAuth() {
  const { user } = useAuth();
  const { loading, error, loadChildren } = useChild();
  const location = useLocation();
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
              <Route path="children/:childId/stories" element={<PersonalizeStoriesPage />} />
              <Route path="children/:childId/:section" element={<EditSectionPage />} />
              <Route path="struggle-words" element={<StruggleWordsPage />} />
            </Route>
          </Route>

          <Route element={<ChildOnly />}>
            <Route path="child" element={<ChildLayout />}>
              <Route index element={<ChildHomePage />} />
              <Route path="buddy" element={<MyBuddyPage />} />
              <Route path="english/*" element={<EnglishRoutes />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </SessionGate>
  );
}
