import React from 'react';
import {View, StyleSheet} from 'react-native';

/**
 * Fakes a CSS `radial-gradient(circle, colour, transparent 70%)` by stacking
 * concentric circles with falling opacity — no SVG dependency needed.
 *
 *   <RadialGlow size={260} color="0,180,154" opacity={0.55} style={{top: -80, right: -80}} />
 *
 * `color` is an "r,g,b" string so each layer can vary only its alpha.
 */
const RadialGlow = ({size, color, opacity = 0.2, layers = 26, style}) => {
  // Alpha stacks multiplicatively; a flat per-layer alpha over many thin rings
  // reads as a smooth falloff rather than visible banding.
  const layerAlpha = (opacity / layers).toFixed(4);

  return (
    <View
      pointerEvents="none"
      style={[styles.wrap, {width: size, height: size}, style]}>
      {Array.from({length: layers}).map((_, i) => {
        // Outermost circle first, so brighter inner circles stack on top.
        const step = (layers - i) / layers;
        const d = size * step;
        return (
          <View
            key={`glow-${step}`}
            style={[
              styles.layer,
              {
                width: d,
                height: d,
                borderRadius: d / 2,
                backgroundColor: `rgba(${color},${layerAlpha})`,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {alignItems: 'center', justifyContent: 'center'},
  layer: {position: 'absolute'},
});

export default RadialGlow;
