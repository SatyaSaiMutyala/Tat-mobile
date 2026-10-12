import React from 'react';

import AppText from './AppText';
import {ScaledSheet} from '../theme';

/** Small uppercase group label used on More and Alerts. */
const GroupTitle = ({children, style}) => (
  <AppText
    variant="mono"
    size={10}
    tracking={1.3}
    uppercase
    weight="bold"
    style={[styles.title, style]}>
    {children}
  </AppText>
);

const styles = ScaledSheet.create({
  title: {
    marginTop: '4@vs',
    marginBottom: '8@vs',
    marginHorizontal: '4@s',
  },
});

export default GroupTitle;
