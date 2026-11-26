// FIXED HEADER - the ONE header of the whole app (☰ + logo + 🏠 + 🔒 Parent + language).
//
// It lives above the navigator (see AppNavigator.js), so when you open another
// screen only the content below it slides. Screens do not draw a header any more:
// <Screen mode="child"> just tells this header which buttons to show.
// While Preview mode is on it also shows the PreviewBanner; leaving the preview asks for the
// Parent PIN when the parent has one.

import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppHeader from './AppHeader';
import PinModal from './PinModal';
import PreviewBanner from './PreviewBanner';
import { useHeaderConfig } from '../../app/context/HeaderContext';
import { useAuth } from '../../app/context/AuthContext';
import { navigationRef, useCurrentRouteKey } from '../../app/navigation/navigationRef';
import { useChild } from '../../app/store/useChild';
import { usePreview } from '../../app/store/usePreview';
import { goToChildHome, goToParentHome } from '../../app/navigation/helpers';
import { COLORS } from '../theme/theme';

const HOME_ROUTES = ['ChildHome', 'ParentHome'];

export default function FixedHeader() {
  const { configs, pressMenu } = useHeaderConfig();
  const routeKey = useCurrentRouteKey();
  const { exitChildMode } = useChild();
  const { pin } = useAuth();
  const { isPreview, endPreview } = usePreview();
  const [pinOpen, setPinOpen] = useState(false);

  const config = (routeKey && configs[routeKey]) || {};
  const isChild = config.mode === 'child';
  const isParent = config.mode === 'parent';
  const route = navigationRef.isReady() ? navigationRef.getCurrentRoute() : null;
  const routeName = route ? route.name : '';

  function openEditAvatar() {
    if (routeName !== 'EditAvatar') navigationRef.navigate('EditAvatar');
  }

  function goHome() {
    if (isChild) goToChildHome(navigationRef);
    else goToParentHome(navigationRef);
  }

  function backToParent() {
    setPinOpen(false);
    if (isPreview) endPreview();
    exitChildMode();
    goToParentHome(navigationRef);
  }

  function handleParentPress() {
    if (isPreview && !pin) backToParent();
    else setPinOpen(true);
  }

  const showHome = (isChild || isParent) && !HOME_ROUTES.includes(routeName);

  return (
    <View style={{ backgroundColor: COLORS.white, zIndex: 5 }}>
      <SafeAreaView edges={['top', 'left', 'right']} style={{ backgroundColor: COLORS.white }}>
        <AppHeader
          avatar={config.avatar}
          onLogoPress={isChild ? openEditAvatar : undefined}
          onHomePress={showHome ? goHome : undefined}
          onParentPress={isChild ? handleParentPress : undefined}
          onMenuPress={config.menu ? () => pressMenu(routeKey) : undefined}
        />
        {isPreview ? <PreviewBanner onExit={handleParentPress} /> : null}
      </SafeAreaView>
      <PinModal visible={pinOpen} onClose={() => setPinOpen(false)} onSuccess={backToParent} />
    </View>
  );
}
