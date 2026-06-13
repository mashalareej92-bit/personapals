import { useRef, useEffect } from 'react';
import { Animated } from 'react-native';

/**
 * Gentle continuous "float" animation for Milo.
 * Returns an Animated.Value to plug into a translateY transform.
 */
export const useMiloAnimation = () => {
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [floatAnim]);

  return floatAnim;
};
