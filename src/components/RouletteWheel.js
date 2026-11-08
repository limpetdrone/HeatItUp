import React, { useState, useEffect, useRef } from 'react';
import { View, Animated, Easing, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from '../i18n/ui';
import ActionButton from './ActionButton';
import { ui, colors } from '../theme';

const SLICE_COLORS = [
  '#C42854', // Crimson Berry
  '#2E1343', // Deep Midnight Purple
  '#E85A3F', // Ember Flame
  '#3F1A5A', // Rich Violet
  '#FF7A90', // Neon Rose
  '#501538', // Dark Mulberry
  '#EAA028', // Golden Amber
  '#6E1E4F'  // Velvet Wine
];

const WHEEL_SIZE = 280;
const RADIUS = WHEEL_SIZE / 2;

export default function RouletteWheel({
  title = 'Szerencsekerék',
  subtitle,
  labels = [],
  onSpin,
  onClose,
  autoSpin = true
}) {
  const [angle] = useState(() => new Animated.Value(0));
  const [pointerTick] = useState(() => new Animated.Value(0));
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const timerRef = useRef(null);
  const pointerAnimRef = useRef(null);

  const N = Math.max(1, labels.length);
  const sliceAngle = 360 / N;
  const sliceAngleRad = (2 * Math.PI) / N;
  const halfBase = N >= 3 ? Math.ceil(RADIUS * Math.tan(sliceAngleRad / 2) + 1.5) : RADIUS;

  useEffect(() => {
    return () => {
      angle.stopAnimation();
      pointerTick.stopAnimation();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (pointerAnimRef.current) clearInterval(pointerAnimRef.current);
    };
  }, [angle, pointerTick]);

  // Autostart spin shortly after modal appears
  useEffect(() => {
    if (autoSpin) {
      const startTimer = setTimeout(() => {
        spin();
      }, 250);
      return () => clearTimeout(startTimer);
    }
  }, [autoSpin]);

  function spin() {
    if (spinning || winner !== null) return;
    setSpinning(true);
    setWinner(null);

    const targetIndex = Math.floor(Math.random() * N);

    // Target alignment math: slice center aligns with 12 o'clock pointer
    const sliceCenter = targetIndex * sliceAngle;
    const baseAngle = (360 - (sliceCenter % 360)) % 360;
    // Small natural jitter within +/- 20% of slice half-width
    const jitter = (Math.random() - 0.5) * (sliceAngle * 0.35);
    const destination = 5 * 360 + baseAngle + jitter;

    angle.setValue(0);

    // Subtle flutter on the pointer during the high-speed phase
    let flutterCount = 0;
    pointerAnimRef.current = setInterval(() => {
      flutterCount++;
      if (flutterCount < 25) {
        Animated.sequence([
          Animated.timing(pointerTick, { toValue: -6, duration: 40, useNativeDriver: true }),
          Animated.timing(pointerTick, { toValue: 3, duration: 40, useNativeDriver: true }),
          Animated.timing(pointerTick, { toValue: 0, duration: 40, useNativeDriver: true })
        ]).start();
      } else {
        clearInterval(pointerAnimRef.current);
      }
    }, 120);

    // 3.5 seconds realistic mechanical deceleration
    Animated.timing(angle, {
      toValue: destination,
      duration: 3500,
      easing: Easing.bezier(0.12, 0.78, 0.28, 1.0),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (pointerAnimRef.current) clearInterval(pointerAnimRef.current);
      pointerTick.setValue(0);
      if (finished) {
        setSpinning(false);
        setWinner(labels[targetIndex]);
        timerRef.current = setTimeout(() => {
          onSpin(targetIndex);
        }, 800);
      }
    });
  }

  const spinRotation = angle.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg']
  });

  const pointerRotation = pointerTick.interpolate({
    inputRange: [-10, 10],
    outputRange: ['-10deg', '10deg']
  });

  return (
    <View style={styles.container}>
      <Text accessibilityRole="header" style={[ui.title, styles.titleText]}>
        {title}
      </Text>
      {!!subtitle && (
        <Text style={[ui.muted, styles.subtitleText]}>{subtitle}</Text>
      )}

      {/* Wheel Area with Pointer */}
      <View style={styles.wheelWrapper}>
        {/* Top Pointer Needle */}
        <Animated.View
          style={[
            styles.pointerContainer,
            { transform: [{ rotate: pointerRotation }] }
          ]}
        >
          <View style={styles.pointerNeedle} />
          <View style={styles.pointerDot} />
        </Animated.View>

        {/* Rotating Wheel Body */}
        <Animated.View
          style={[
            styles.wheelBody,
            { transform: [{ rotate: spinRotation }] }
          ]}
        >
          {/* N = 1 Case */}
          {N === 1 && (
            <View style={[styles.sliceBase, { backgroundColor: SLICE_COLORS[0], justifyContent: 'center' }]}>
              <Text numberOfLines={2} style={styles.sliceText}>{labels[0]}</Text>
            </View>
          )}

          {/* N = 2 Case */}
          {N === 2 && (
            <>
              <View style={[styles.halfSliceTop, { backgroundColor: SLICE_COLORS[0] }]}>
                <Text numberOfLines={2} style={[styles.sliceText, { marginTop: 45 }]}>{labels[0]}</Text>
              </View>
              <View style={[styles.halfSliceBottom, { backgroundColor: SLICE_COLORS[1] }]}>
                <Text numberOfLines={2} style={[styles.sliceText, { marginTop: 45 }]}>{labels[1]}</Text>
              </View>
            </>
          )}

          {/* N >= 3 Slices */}
          {N >= 3 && labels.map((label, i) => {
            const color = SLICE_COLORS[i % SLICE_COLORS.length];
            return (
              <View
                key={i}
                style={[
                  styles.sliceContainer,
                  { transform: [{ rotate: `${i * sliceAngle}deg` }] }
                ]}
              >
                {/* Wedge Triangle */}
                <View
                  style={[
                    styles.wedgeTriangle,
                    {
                      left: RADIUS - halfBase,
                      borderLeftWidth: halfBase,
                      borderRightWidth: halfBase,
                      borderTopWidth: RADIUS,
                      borderTopColor: color
                    }
                  ]}
                />
                {/* Subtle Divider Line */}
                <View style={styles.dividerLine} />
                {/* Label text radially positioned */}
                <View style={styles.labelWrapper}>
                  <Text
                    numberOfLines={2}
                    style={[
                      styles.sliceText,
                      {
                        fontSize: N > 8 ? 11 : 13,
                        width: Math.min(100, Math.max(50, halfBase * 1.8))
                      }
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Perimeter Golden Rivets */}
          {labels.map((_, i) => {
            const dotAngle = (i + 0.5) * sliceAngleRad;
            const cx = RADIUS + (RADIUS - 7) * Math.sin(dotAngle) - 3;
            const cy = RADIUS - (RADIUS - 7) * Math.cos(dotAngle) - 3;
            return (
              <View
                key={`dot:${i}`}
                style={[styles.rivetDot, { left: cx, top: cy }]}
              />
            );
          })}

          {/* Center Hub */}
          <View style={styles.centerHub}>
            <Text style={{ fontSize: 20 }}>🔥</Text>
          </View>
        </Animated.View>
      </View>

      {/* Winner Display / Result Announcement */}
      {winner ? (
        <View style={styles.winnerCard}>
          <Text style={styles.winnerText}>✨ Kiválasztva: {winner} ✨</Text>
        </View>
      ) : (
        <Text style={[ui.muted, { textAlign: 'center', minHeight: 28 }]}>
          {spinning ? 'A kerék pörög…' : 'Érintsd meg a pörgetéshez'}
        </Text>
      )}

      {/* Actions */}
      <View style={{ width: '100%', gap: 10, marginTop: 8 }}>
        {!spinning && winner === null && (
          <ActionButton title="Pörgetés" onPress={spin} />
        )}
        {onClose && (
          <ActionButton
            title="Mégse"
            secondary
            disabled={spinning}
            onPress={onClose}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    width: '100%'
  },
  titleText: {
    textAlign: 'center',
    marginBottom: 4,
    fontSize: 26
  },
  subtitleText: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 14
  },
  wheelWrapper: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12
  },
  wheelBody: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    borderRadius: RADIUS,
    borderWidth: 5,
    borderColor: colors.focus,
    backgroundColor: colors.background,
    overflow: 'hidden',
    shadowColor: colors.focus,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8
  },
  pointerContainer: {
    position: 'absolute',
    top: -14,
    zIndex: 20,
    alignItems: 'center'
  },
  pointerNeedle: {
    width: 0,
    height: 0,
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 26,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.focus,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.6,
    shadowRadius: 3,
    elevation: 10
  },
  pointerDot: {
    position: 'absolute',
    top: 3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF'
  },
  sliceContainer: {
    position: 'absolute',
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center'
  },
  wedgeTriangle: {
    position: 'absolute',
    top: 0,
    width: 0,
    height: 0,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent'
  },
  dividerLine: {
    position: 'absolute',
    top: 0,
    left: RADIUS - 0.5,
    width: 1,
    height: RADIUS,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  labelWrapper: {
    position: 'absolute',
    top: 18,
    left: 0,
    width: WHEEL_SIZE,
    alignItems: 'center'
  },
  sliceText: {
    color: '#FFFFFF',
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.85)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3
  },
  sliceBase: {
    width: WHEEL_SIZE,
    height: WHEEL_SIZE,
    alignItems: 'center'
  },
  halfSliceTop: {
    position: 'absolute',
    top: 0,
    width: WHEEL_SIZE,
    height: RADIUS,
    alignItems: 'center'
  },
  halfSliceBottom: {
    position: 'absolute',
    top: RADIUS,
    width: WHEEL_SIZE,
    height: RADIUS,
    alignItems: 'center'
  },
  rivetDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.focus,
    zIndex: 10
  },
  centerHub: {
    position: 'absolute',
    top: RADIUS - 26,
    left: RADIUS - 26,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#170E22',
    borderWidth: 3,
    borderColor: colors.focus,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 6
  },
  winnerCard: {
    backgroundColor: 'rgba(255, 197, 110, 0.2)',
    borderColor: colors.focus,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 4
  },
  winnerText: {
    color: colors.focus,
    fontWeight: '800',
    fontSize: 16,
    textAlign: 'center'
  }
});
