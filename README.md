# Trust TAT — TrustLab Diagnostics mobile app

React Native 0.75.4 CLI project (JavaScript). UI implementation of the
`trust-tat-mobile` reference design — **UI only, no API integration yet**.

```bash
npm install
npm start
npm run android
npm run ios      # macOS: cd ios && pod install first
npm run lint
npm test
```

## Folder structure

```
src/
├─ components/     reusable UI library — screens compose from these only
│  ├─ AccentBar.js      coloured left-edge stripe on cards
│  ├─ ActionBar.js      sticky detail action bar + PrimaryAction / CircleAction
│  ├─ AlertRow.js       notification row (crit / warn / info / ok)
│  ├─ AppBar.js         top bar: back, eyebrow, display title, right icon
│  ├─ AppText.js        the single text primitive (body / display / mono)
│  ├─ Avatar.js         gradient initials circle
│  ├─ BucketGrid.js     4-column colour bucket strip + BucketFilterNote
│  ├─ CarryBanner.js    "N pending past release date" banner
│  ├─ Chips.js          horizontal filter chips
│  ├─ EmptyState.js     tinted icon + title + message
│  ├─ GroupTitle.js     uppercase section label
│  ├─ HeroCard.js       gradient hero stat card
│  ├─ HomeHeader.js     avatar + greeting + bell
│  ├─ MetricCard.js     small stat tile
│  ├─ MiniItem.js       compact urgent-sample row
│  ├─ MoreItem.js       settings list row
│  ├─ PulseDot.js       animated pulsing dot
│  ├─ RadialGlow.js     soft radial glow (CSS radial-gradient substitute)
│  ├─ SampleCard.js     sample row (today + overdue variants)
│  ├─ Screen.js         page shell: safe area + status bar
│  ├─ SectionHead.js    "LABEL · See all →"
│  ├─ StatusCard.js     SLA status banner on detail
│  ├─ TabBar.js         custom 5-tab bottom nav with badges
│  ├─ Tag.js            priority / branch / SLA pill
│  ├─ TextField.js      translucent input for the dark sign-in
│  ├─ Timeline.js       6-phase pipeline
│  └─ Toast.js          app-wide toast (driven by the ui slice)
├─ data/           reference master data + deterministic mock samples
├─ navigation/     RootNavigator, MainTabs, routes
├─ screens/        SignIn, Home, Today, Overdue, Detail, Alerts, More
├─ store/          Redux Toolkit store + hooks
│  └─ slices/      authSlice, samplesSlice, uiSlice
├─ theme/          colors, fonts, metrics, shadows
└─ utils/          format (dates/durations), tat (lifecycle helpers)
```

## Typography — Outfit

The reference design uses three families; this app renders all of them with
**Outfit** (bundled in `assets/fonts/`, linked for Android and iOS):

| Design font | App equivalent | `AppText` variant |
| --- | --- | --- |
| DM Sans (body) | Outfit Regular → ExtraBold | `body` |
| Bebas Neue (display) | Outfit Bold, uppercase + tracking | `display` |
| JetBrains Mono (labels) | Outfit Medium + tracking | `mono` |

```jsx
<AppText variant="display" size={26} tracking={1.2}>TODAY'S TAT</AppText>
<AppText variant="mono" size={10} uppercase>CSD daily · release queue</AppText>
<AppText size={13} weight="bold">Complete Blood Count</AppText>
```

## Responsive sizing — react-native-size-matters

Every screen and component sizes through `ScaledSheet` or the helpers in
[src/theme/metrics.js](src/theme/metrics.js). No raw pixel values in styles.

```js
import {ScaledSheet} from '../theme';

const styles = ScaledSheet.create({
  card: {padding: '16@ms', marginBottom: '12@vs', borderRadius: '14@ms'},
});
```

| Helper | Use for |
| --- | --- |
| `s(n)` / `'16@s'` | widths, horizontal padding & margin |
| `vs(n)` / `'12@vs'` | heights, vertical padding & margin |
| `ms(n)` / `'14@ms'` | font sizes, radii, icon sizes |

## State — Redux Toolkit

Store in [src/store/index.js](src/store/index.js), provided at the root in
[App.js](App.js). Screens use `useAppSelector` / `useAppDispatch` from
[src/store/hooks.js](src/store/hooks.js).

- **authSlice** — demo sign-in / sign-out; drives which navigator the root shows.
- **samplesSlice** — the sample list plus memoised selectors (`selectTodayPending`,
  `selectPastOverdue`, `selectMostUrgent`, `selectDueInOneHour`, …). All TAT
  bucketing and sorting lives here, not in the screens.
- **uiSlice** — per-screen chip/bucket filters and the global toast.

## Icons

`react-native-vector-icons` — **Feather** for the stroke icon set in the design,
**MaterialCommunityIcons** for `fingerprint`, `whatsapp` and
`office-building-outline`. Fonts are copied by the `fonts.gradle` line in
[android/app/build.gradle](android/app/build.gradle).

## Mock data

[src/data/generateSamples.js](src/data/generateSamples.js) ports the reference
design's seeded generator, so the list is identical on every launch. Timestamps
are epoch millis to keep the Redux state serialisable. `NOW` is pinned to 14:30
today, matching the design.

Replace this with API responses when integration starts — the selectors and
components already take the same shape.
