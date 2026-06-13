import React from 'react';
import { View, Image, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { getMilo, MiloKey } from '../../constants/miloImages';

interface MiloAvatarProps {
  /** Which Milo pose to show. Every pose currently maps to milo_base.png. */
  pose?: MiloKey;
  style?: StyleProp<ViewStyle>;
}

export default function MiloAvatar({ pose = 'base', style }: MiloAvatarProps) {
  return (
    <View style={[styles.container, style]}>
      <Image source={getMilo(pose)} style={styles.layer} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: 150, height: 150 },
  layer: { width: '100%', height: '100%', resizeMode: 'contain' },
});
