import React, {useEffect, useState} from 'react';
import {
  View,
  Modal,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import AppText from './AppText';
import {fmtDuration, fmtTimeRemaining} from '../utils/format';
import {colors, alpha, fonts, ms, ScaledSheet, SCREEN_HEIGHT} from '../theme';

/**
 * Height the keyboard currently occupies, or 0.
 *
 * A <Modal> is its own Android window, so `adjustResize` never reaches it and
 * KeyboardAvoidingView has nothing to react to — the keyboard just covers the
 * sheet. Measuring it and padding by hand is what actually works in a modal.
 */
const useKeyboardHeight = () => {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // iOS fires Will* in step with the animation; Android only ever fires Did*.
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const show = Keyboard.addListener(showEvent, e =>
      setHeight(e.endCoordinates?.height ?? 0),
    );
    const hide = Keyboard.addListener(hideEvent, () => setHeight(0));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return height;
};

/** Matches the server's Ticket.priority enum. */
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const PRIORITY_TONE = {
  Low: colors.ink3,
  Medium: colors.tealDeep,
  High: colors.warn,
  Critical: colors.crit,
};

/**
 * Suggested priority, mirroring what the API would pick if we sent none —
 * shown pre-selected so the user sees the same answer either way.
 */
const suggestPriority = sample => {
  const remaining = sample?.remaining_minutes;
  if (remaining === null || remaining === undefined) {
    return 'Medium';
  }
  if (remaining <= -1440) {
    return 'Critical';
  }
  return remaining < 60 ? 'High' : 'Medium';
};

/** The stage the sample hasn't cleared — where the delay is, unless told otherwise. */
const stuckStage = sample =>
  sample?.phases?.find(p => p.state === 'current') ?? sample?.phases?.[0] ?? null;

/** Mirrors the server's title format, so an untouched title reads the same either way. */
const defaultTitle = (sample, stageName) => {
  const subject = [sample?.barcode, sample?.test_name].filter(Boolean).join(' · ');
  const lead = stageName ? `TAT breach at ${stageName}` : 'TAT breach';

  return `${lead} — ${subject}`.slice(0, 180);
};

/** Minutes spent in a stage: the recorded duration, or time since it opened. */
const stageMinutes = phase => {
  if (phase?.duration_hours !== null && phase?.duration_hours !== undefined) {
    return phase.duration_hours * 60;
  }
  if (phase?.state === 'current' && phase?.started_at) {
    const elapsed = (Date.now() - new Date(phase.started_at).getTime()) / 60000;
    return elapsed > 0 ? elapsed : null;
  }
  return null;
};

/**
 * Raise-a-ticket form for the sample detail screen.
 *
 *   <EscalateSheet
 *     visible={open}
 *     sample={sample}
 *     submitting={busy}
 *     onSubmit={({title, description, priority}) => …}
 *     onClose={…}
 *   />
 *
 * Title and priority are prefilled from the sample, so the fast path is open →
 * Raise. The note is optional; the server appends the full TAT context (branch,
 * deadline, phase, overdue-by) underneath whatever is typed here.
 */
const EscalateSheet = ({visible, sample, submitting = false, onSubmit, onClose}) => {
  const [title, setTitle] = useState('');
  const [titleEdited, setTitleEdited] = useState(false);
  const [note, setNote] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [stageKey, setStageKey] = useState(null);
  const keyboard = useKeyboardHeight();

  const stages = sample?.phases ?? [];
  const remaining = sample?.remaining_minutes;
  const overdue = remaining !== null && remaining !== undefined && remaining < 0;

  const statusLine = [
    remaining === null || remaining === undefined
      ? 'No deadline'
      : overdue
      ? `Overdue by ${fmtTimeRemaining(remaining)}`
      : `Due in ${fmtTimeRemaining(remaining)}`,
    sample?.phase ? `at ${sample.phase}` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  // Reset on each open — a stale draft from the previous sample would be worse
  // than an empty one.
  useEffect(() => {
    if (!visible) {
      return;
    }
    const stuck = stuckStage(sample);

    setStageKey(stuck?.key ?? null);
    setTitle(defaultTitle(sample, stuck?.name));
    setTitleEdited(false);
    setNote('');
    setPriority(suggestPriority(sample));
  }, [visible, sample]);

  // Re-pointing the blame rewrites the title — but never over something the
  // user typed themselves.
  const pickStage = picked => {
    setStageKey(picked.key);
    if (!titleEdited) {
      setTitle(defaultTitle(sample, picked.name));
    }
  };

  const canSubmit = title.trim().length > 0 && !submitting;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={submitting ? undefined : onClose}
      statusBarTranslucent>
      <Pressable
        style={styles.backdrop}
        onPress={submitting ? undefined : onClose}
      />

      {/*
        Padding lifts the sheet clear of the keyboard; the matching maxHeight
        shrink stops it growing taller than what's left of the screen, so the
        action row can never end up underneath.
      */}
      <View
        style={[styles.centre, {paddingBottom: keyboard}]}
        pointerEvents="box-none">
        <View
          style={[styles.sheet, {maxHeight: SCREEN_HEIGHT * 0.86 - keyboard}]}>
          <View style={styles.grabber} />

          <View style={styles.head}>
            <View style={styles.headIcon}>
              <Ionicons name="warning-outline" size={ms(18)} color={colors.warn} />
            </View>
            <View style={styles.headText}>
              <AppText variant="display" size={16} tracking={1}>
                Raise a ticket
              </AppText>
              <AppText size={11.5} color={colors.ink3} style={styles.headCaption}>
                Goes to the helpdesk with this sample's full TAT context.
              </AppText>
            </View>
          </View>

          <ScrollView
            style={styles.body}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            {/* Where the sample actually is, so the raiser can see what
                they're reporting before they report it. */}
            <View style={styles.status}>
              <AppText variant="mono" size={11} weight="bold" color={colors.greenDeep} numberOfLines={1}>
                {sample?.barcode ?? '—'}
              </AppText>
              <AppText size={12.5} weight="bold" numberOfLines={2} style={styles.statusTest}>
                {sample?.test_name ?? '—'}
              </AppText>
              <AppText
                variant="mono"
                size={10}
                tracking={0.5}
                uppercase
                color={overdue ? colors.crit : colors.ink3}>
                {statusLine}
              </AppText>
            </View>

            <AppText variant="mono" size={10} tracking={0.6} uppercase style={styles.label}>
              Where is the delay?
            </AppText>
            <View style={styles.stages}>
              {stages.map(item => (
                <StageRow
                  key={item.key}
                  stage={item}
                  active={item.key === stageKey}
                  disabled={submitting}
                  onPress={() => pickStage(item)}
                />
              ))}
            </View>

            <AppText variant="mono" size={10} tracking={0.6} uppercase style={styles.label}>
              Title
            </AppText>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={text => {
                setTitle(text);
                setTitleEdited(true);
              }}
              editable={!submitting}
              maxLength={180}
              placeholder="What's wrong with this sample?"
              placeholderTextColor={colors.ink4}
              allowFontScaling={false}
            />

            <AppText variant="mono" size={10} tracking={0.6} uppercase style={styles.label}>
              Note (optional)
            </AppText>
            <TextInput
              style={[styles.input, styles.textarea]}
              value={note}
              onChangeText={setNote}
              editable={!submitting}
              maxLength={4000}
              multiline
              textAlignVertical="top"
              placeholder="Anything the helpdesk should know beyond the sample details."
              placeholderTextColor={colors.ink4}
              allowFontScaling={false}
            />

            <AppText variant="mono" size={10} tracking={0.6} uppercase style={styles.label}>
              Priority
            </AppText>
            <View style={styles.priorities}>
              {PRIORITIES.map(level => {
                const active = level === priority;
                return (
                  <TouchableOpacity
                    key={level}
                    activeOpacity={0.8}
                    disabled={submitting}
                    onPress={() => setPriority(level)}
                    style={[
                      styles.pill,
                      active && {
                        backgroundColor: PRIORITY_TONE[level],
                        borderColor: PRIORITY_TONE[level],
                      },
                    ]}>
                    <AppText
                      size={11}
                      weight="bold"
                      tracking={0.4}
                      color={active ? colors.white : colors.ink3}>
                      {level}
                    </AppText>
                  </TouchableOpacity>
                );
              })}
            </View>
          </ScrollView>

          <View style={styles.actions}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={onClose}
              disabled={submitting}
              style={[styles.button, styles.cancel]}>
              <AppText size={12.5} weight="bold" tracking={0.6} uppercase color={colors.ink2}>
                Cancel
              </AppText>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                onSubmit({
                  title: title.trim(),
                  description: note.trim(),
                  priority,
                  phaseKey: stageKey,
                })
              }
              disabled={!canSubmit}
              style={[styles.button, styles.submit, !canSubmit && styles.busy]}>
              {submitting ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <AppText
                  size={12.5}
                  weight="extraBold"
                  tracking={0.6}
                  uppercase
                  color={colors.white}>
                  Raise ticket
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * One workflow stage, selectable. The state dot and timing come straight from
 * the sample's own timeline, so this doubles as the "where is it" answer.
 */
const StageRow = ({stage, active, disabled, onPress}) => {
  const minutes = stageMinutes(stage);

  const tone =
    stage.state === 'done'
      ? colors.ok
      : stage.state === 'current'
      ? colors.warn
      : colors.line;

  const timing =
    stage.state === 'pending'
      ? 'Not reached'
      : minutes !== null
      ? `${fmtDuration(minutes)}${stage.state === 'current' ? ' · still here' : ''}`
      : stage.state === 'current'
      ? 'In progress'
      : 'Cleared';

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled}
      onPress={onPress}
      style={[styles.stage, active && styles.stageActive]}>
      <View style={[styles.stageDot, {backgroundColor: tone}]} />

      <View style={styles.stageText}>
        <AppText size={12} weight={active ? 'extraBold' : 'medium'} numberOfLines={1}>
          {stage.name}
        </AppText>
        <AppText variant="mono" size={9.5} tracking={0.4} uppercase color={colors.ink4}>
          {timing}
        </AppText>
      </View>

      {active ? (
        <Ionicons name="radio-button-on" size={ms(17)} color={colors.tealDeep} />
      ) : (
        <Ionicons name="ellipse-outline" size={ms(17)} color={colors.line} />
      )}
    </TouchableOpacity>
  );
};

const styles = ScaledSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(11,20,16,0.5)',
  },
  centre: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
  },
  sheet: {
    // maxHeight is applied inline — it has to shrink with the keyboard.
    backgroundColor: colors.paper,
    borderTopLeftRadius: '20@ms',
    borderTopRightRadius: '20@ms',
    paddingHorizontal: '16@s',
    paddingTop: '10@vs',
    paddingBottom: '16@vs',
  },
  grabber: {
    alignSelf: 'center',
    width: '40@s',
    height: '4@vs',
    borderRadius: '2@ms',
    backgroundColor: colors.line,
    marginBottom: '14@vs',
  },
  head: {flexDirection: 'row', alignItems: 'center', gap: '12@s'},
  headIcon: {
    width: '38@ms',
    height: '38@ms',
    borderRadius: '19@ms',
    backgroundColor: alpha.yellowNote,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headText: {flex: 1, minWidth: 0},
  headCaption: {marginTop: '3@vs'},
  // flexShrink defaults to 0 in RN — without it the fields would overflow the
  // shortened sheet instead of scrolling inside it once the keyboard is up.
  body: {flexGrow: 0, flexShrink: 1, marginTop: '16@vs'},
  label: {marginBottom: '6@vs', color: colors.ink4},
  status: {
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    marginBottom: '16@vs',
    gap: '3@vs',
  },
  statusTest: {marginBottom: '2@vs'},
  stages: {gap: '6@s', marginBottom: '16@vs'},
  stage: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@s',
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '10@ms',
    paddingHorizontal: '12@s',
    paddingVertical: '9@vs',
  },
  stageActive: {
    borderColor: colors.teal,
    backgroundColor: alpha.tealFaint,
  },
  stageDot: {
    width: '8@ms',
    height: '8@ms',
    borderRadius: '4@ms',
  },
  stageText: {flex: 1, minWidth: 0, gap: '2@vs'},
  input: {
    backgroundColor: colors.white,
    borderWidth: '1@ms',
    borderColor: colors.line,
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '12@vs',
    marginBottom: '14@vs',
    fontFamily: fonts.medium,
    fontSize: '13@ms',
    color: colors.ink,
  },
  textarea: {height: '104@vs'},
  priorities: {flexDirection: 'row', gap: '8@s', marginBottom: '4@vs'},
  pill: {
    flex: 1,
    height: '34@vs',
    borderRadius: '999@ms',
    borderWidth: '1@ms',
    borderColor: colors.line,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: {flexDirection: 'row', gap: '10@s', marginTop: '16@vs'},
  button: {
    flex: 1,
    height: '46@vs',
    borderRadius: '12@ms',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancel: {
    backgroundColor: colors.paper2,
    borderWidth: '1@ms',
    borderColor: colors.line,
  },
  submit: {backgroundColor: colors.warn},
  busy: {opacity: 0.6},
});

export default EscalateSheet;
