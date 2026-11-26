// USE PREVIEW - read and change the preview switch from any screen.
//   const { isPreview, demoChild, startPreview, endPreview } = usePreview();

import { useDispatch, useSelector } from 'react-redux';
import { DEMO_CHILD } from '../../shared/utils/demoChild';
import { previewEnded, previewStarted, selectPreviewActive } from './previewSlice';

export function usePreview() {
  const dispatch = useDispatch();
  const isPreview = useSelector(selectPreviewActive);

  return {
    isPreview,
    demoChild: DEMO_CHILD,
    startPreview: () => dispatch(previewStarted()),
    endPreview: () => dispatch(previewEnded()),
  };
}
