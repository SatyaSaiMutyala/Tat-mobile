import React, {useState} from 'react';
import {View} from 'react-native';
import Svg, {Rect, Polyline, Line, Circle, Text as SvgText} from 'react-native-svg';

import AppText from './AppText';
import {colors, fonts, vs, s, ms, ScaledSheet} from '../theme';

const PLOT = vs(150); // drawing area for the columns
const TOP = vs(14); // headroom so value labels above the tallest bar fit
const HEIGHT = PLOT + TOP;
const GUTTER = s(30); // left strip holding the value axis

/** Above this many columns the per-bar numbers stop fitting, so the axis carries it. */
const LABEL_LIMIT = 12;

/**
 * Daily volume as columns, with the breached share stacked in red and SLA
 * compliance drawn over the top as a line on its own 0–100% scale.
 *
 *   <TrendChart data={analytics.trend} />
 *
 * Values are readable three ways: a left axis (0 → peak), the count printed
 * above each column while they're few enough to fit, and the compliance figure
 * pinned to the last point of the line.
 */
const TrendChart = ({data = []}) => {
  const [width, setWidth] = useState(0);

  const points = data.filter(Boolean);
  const peak = points.reduce((max, d) => Math.max(max, d.total ?? 0), 0);

  // A flat zero series would divide by zero below and draw nothing useful.
  const scale = peak > 0 ? peak : 1;
  const plotWidth = Math.max(width - GUTTER, 0);
  const step = points.length > 0 ? plotWidth / points.length : 0;
  const barWidth = Math.max(step * 0.68, 1);
  const showValues = points.length <= LABEL_LIMIT && step > 0;

  const centreOf = i => GUTTER + i * step + step / 2;
  const yOf = value => TOP + PLOT - (value / scale) * PLOT;

  const scored = points
    .map((d, i) => ({...d, i}))
    .filter(d => d.compliance !== null && d.compliance !== undefined);

  const line = scored
    .map(d => `${centreOf(d.i)},${TOP + PLOT - (d.compliance / 100) * PLOT}`)
    .join(' ');

  const last = scored[scored.length - 1] ?? null;

  return (
    <View>
      <View style={styles.canvas} onLayout={e => setWidth(e.nativeEvent.layout.width)}>
        {width > 0 && points.length > 0 ? (
          <Svg width={width} height={HEIGHT}>
            {/* Value axis: peak, midpoint, zero — enough to read any column. */}
            {[
              {value: peak, y: TOP},
              {value: Math.round(peak / 2), y: TOP + PLOT / 2},
              {value: 0, y: TOP + PLOT},
            ].map(tick => (
              <React.Fragment key={tick.y}>
                <Line
                  x1={GUTTER}
                  y1={tick.y}
                  x2={width}
                  y2={tick.y}
                  stroke={colors.line2}
                  strokeWidth={1}
                />
                <SvgText
                  x={GUTTER - s(5)}
                  y={tick.y + ms(3)}
                  textAnchor="end"
                  fontFamily={fonts.medium}
                  fontSize={ms(8.5)}
                  fill={colors.ink4}>
                  {tick.value}
                </SvgText>
              </React.Fragment>
            ))}

            {points.map((d, i) => {
              const total = d.total ?? 0;
              const breaches = Math.min(d.breaches ?? 0, total);
              const totalH = (total / scale) * PLOT;
              const breachH = (breaches / scale) * PLOT;
              const x = GUTTER + i * step + (step - barWidth) / 2;

              return (
                <React.Fragment key={d.date ?? i}>
                  <Rect
                    x={x}
                    y={yOf(total)}
                    width={barWidth}
                    height={totalH}
                    fill={colors.tealDeep}
                    rx={barWidth > 4 ? 2 : 0}
                  />
                  {breaches > 0 ? (
                    <Rect
                      x={x}
                      y={TOP + PLOT - breachH}
                      width={barWidth}
                      height={breachH}
                      fill={colors.crit}
                      rx={barWidth > 4 ? 2 : 0}
                    />
                  ) : null}

                  {showValues && total > 0 ? (
                    <SvgText
                      x={centreOf(i)}
                      y={yOf(total) - ms(4)}
                      textAnchor="middle"
                      fontFamily={fonts.bold}
                      fontSize={ms(9)}
                      fill={colors.ink2}>
                      {total}
                    </SvgText>
                  ) : null}
                </React.Fragment>
              );
            })}

            {line ? (
              <Polyline
                points={line}
                fill="none"
                stroke={colors.yellow}
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            ) : null}

            {/* Pin the latest compliance reading to the end of the line. */}
            {last ? (
              <>
                <Circle
                  cx={centreOf(last.i)}
                  cy={TOP + PLOT - (last.compliance / 100) * PLOT}
                  r={ms(3)}
                  fill={colors.yellow}
                />
                <SvgText
                  x={Math.min(centreOf(last.i) + s(6), width - s(2))}
                  y={TOP + PLOT - (last.compliance / 100) * PLOT - ms(5)}
                  textAnchor="end"
                  fontFamily={fonts.bold}
                  fontSize={ms(9)}
                  fill={colors.yellowDark}>
                  {`${last.compliance}%`}
                </SvgText>
              </>
            ) : null}
          </Svg>
        ) : null}
      </View>

      <View style={[styles.axis, {paddingLeft: GUTTER}]}>
        {[points[0], points[Math.floor(points.length / 2)], points[points.length - 1]]
          .filter(Boolean)
          .map((d, i) => (
            <AppText key={`${d.date}-${i}`} variant="mono" size={9} color={colors.ink4}>
              {d.label}
            </AppText>
          ))}
      </View>

      <View style={styles.legend}>
        <Key color={colors.tealDeep} label={`Volume · peak ${peak}`} />
        <Key color={colors.crit} label="Breached" />
        <Key color={colors.yellow} label="Compliance %" />
      </View>
    </View>
  );
};

const Key = ({color, label}) => (
  <View style={styles.key}>
    <View style={[styles.swatch, {backgroundColor: color}]} />
    <AppText variant="mono" size={9} tracking={0.3} uppercase color={colors.ink3}>
      {label}
    </AppText>
  </View>
);

const styles = ScaledSheet.create({
  canvas: {height: HEIGHT, width: '100%'},
  axis: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: '6@vs',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: '12@s',
    marginTop: '10@vs',
  },
  key: {flexDirection: 'row', alignItems: 'center', gap: '5@s'},
  swatch: {width: '8@ms', height: '8@ms', borderRadius: '2@ms'},
});

export default TrendChart;
