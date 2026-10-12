import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View, ScrollView} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  ActionBar,
  AppBar,
  AppText,
  DetailSkeleton,
  ErrorState,
  EscalateSheet,
  PrimaryAction,
  Screen,
  StatusCard,
  Tag,
  Timeline,
} from '../components';
import {parseApiError} from '../services/api';
import {
  raiseEscalationRequest,
  existingEscalationFrom,
} from '../services/escalationApi';
import {useAppDispatch, useAppSelector} from '../store/hooks';
import {selectUser} from '../store/slices/authSlice';
import {
  fetchSampleDetail,
  clearDetail,
  selectDetail,
  selectDataset,
} from '../store/slices/dashboardSlice';
import {showToast} from '../store/slices/uiSlice';
import {categoryTone, categoryWord} from '../utils/category';
import {fmtDateTime, fmtDuration, fmtTimeRemaining} from '../utils/format';
import {colors, alpha, ms, ScaledSheet} from '../theme';

/** API phase state -> the Timeline component's visual state. */
const PHASE_STATE = {
  done: 'done',
  current: 'stuck',
  pending: 'pending',
};

/** ISO string -> display stamp, tolerating nulls. */
const stamp = iso => (iso ? fmtDateTime(new Date(iso).getTime()) : '—');

const DetailScreen = ({navigation, route}) => {
  const dispatch = useAppDispatch();
  const {id} = route.params;

  const {sample, status, error} = useAppSelector(selectDetail);

  useEffect(() => {
    dispatch(fetchSampleDetail(id));
    return () => dispatch(clearDetail());
  }, [dispatch, id]);

  const retry = useCallback(() => dispatch(fetchSampleDetail(id)), [dispatch, id]);
  const toast = useCallback(message => dispatch(showToast(message)), [dispatch]);

  const user = useAppSelector(selectUser);
  const dataset = useAppSelector(selectDataset);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [raising, setRaising] = useState(false);
  const [escalation, setEscalation] = useState(null);

  // The sample payload carries any existing escalation; a successful raise
  // updates it locally so the bar flips without refetching the whole sample.
  useEffect(() => {
    setEscalation(sample?.escalation ?? null);
  }, [sample?.escalation]);

  const raise = useCallback(
    async ({title, description, priority, phaseKey}) => {
      setRaising(true);
      try {
        const created = await raiseEscalationRequest({
          sampleId: id,
          dataset,
          title,
          description,
          priority,
          phaseKey,
          raisedBy: user?.name,
        });
        setEscalation(created);
        setSheetOpen(false);
        toast(created?.ticket_code ? `Ticket ${created.ticket_code} raised` : 'Ticket raised');
      } catch (err) {
        // A 409 means someone already raised this one — that's the escalated
        // state arriving, not a failure.
        const existing = existingEscalationFrom(err);
        if (existing) {
          setEscalation(existing);
          setSheetOpen(false);
          toast(`Already escalated as ${existing.ticket_code}`);
          return;
        }
        toast(parseApiError(err).message);
      } finally {
        setRaising(false);
      }
    },
    [dataset, id, toast, user],
  );

  const phases = useMemo(() => {
    if (!sample?.phases) {
      return [];
    }

    return sample.phases.map(phase => {
      const isDone = phase.state === 'done';
      const isStuck = phase.state === 'current';

      // Guard against a start stamp that reads as future (clock skew between
      // the handset and the lab system) — a negative "stuck" time is nonsense.
      const rawElapsed = isStuck && phase.started_at
        ? (Date.now() - new Date(phase.started_at).getTime()) / 60000
        : null;
      const elapsed = rawElapsed !== null && rawElapsed > 0 ? rawElapsed : null;

      // A pending phase can still carry a `completed_at` — `delivery_at` is the
      // scheduled release, so it may sit in the past while the phase has not
      // happened. Only a done phase gets to show a timestamp.
      const detail = isDone
        ? stamp(phase.completed_at)
        : isStuck
        ? 'In progress'
        : 'Pending';

      let duration = null;
      if (isDone && phase.duration_hours !== null) {
        duration = fmtDuration(phase.duration_hours * 60);
      } else if (isStuck && elapsed !== null) {
        duration = `${fmtDuration(elapsed)} · STUCK`;
      }

      return {
        name: phase.name,
        state: PHASE_STATE[phase.state] || 'pending',
        detail,
        duration,
        durationTone: isStuck ? 'stuck' : 'ok',
      };
    });
  }, [sample]);

  if (status === 'loading' && !sample) {
    return (
      <Screen edges={['top', 'bottom']} statusBarColor={colors.white}>
        <AppBar eyebrow="Sample detail" title="SAMPLE" onBack={() => navigation.goBack()} />
        <DetailSkeleton />
      </Screen>
    );
  }

  if (!sample) {
    return (
      <Screen edges={['top', 'bottom']} statusBarColor={colors.white}>
        <AppBar eyebrow="Sample detail" title="UNAVAILABLE" onBack={() => navigation.goBack()} />
        <ErrorState
          title="Sample unavailable"
          message={error || 'This sample could not be found.'}
          onRetry={retry}
        />
      </Screen>
    );
  }

  const remaining = sample.remaining_minutes;
  const released = sample.is_approved;
  // delivery_at is nullable — without it there is no deadline to reckon
  // against, so the sample is neither "past" nor in a closing window.
  const hasDeadline = sample.deadline_at !== null && remaining !== null;
  const past = !released && hasDeadline && remaining < 0;
  const tight = !released && hasDeadline && remaining >= 0 && remaining < 60;

  let tone = 'ok';
  let eyebrow = 'STATUS · ON TRACK';
  let value = hasDeadline ? fmtTimeRemaining(remaining) : '—';
  let note = hasDeadline
    ? `Due ${stamp(sample.deadline_at)} · currently at ${sample.phase}`
    : `No scheduled release date · currently at ${sample.phase}`;

  if (released) {
    const wasLate = sample.delayed;
    tone = 'released';
    eyebrow = wasLate ? 'RELEASED · LATE' : 'RELEASED · ON TIME';
    value = sample.tat_hours !== null ? `${fmtDuration(sample.tat_hours * 60)} TAT` : 'RELEASED';
    note = sample.approved_at
      ? `Approved ${stamp(sample.approved_at)}${wasLate ? ' · SLA breached' : ' · within SLA'}`
      : 'Released';
  } else if (past) {
    tone = 'past';
    eyebrow = 'STATUS · PAST DEADLINE';
    value = `−${fmtTimeRemaining(remaining)}`;
    note = `Was due ${stamp(sample.deadline_at)} · stuck at ${sample.phase}`;
  } else if (tight) {
    tone = 'tight';
    eyebrow = 'STATUS · CLOSING WINDOW';
    note = `Due ${stamp(sample.deadline_at)} · push ${sample.phase} now`;
  }

  return (
    <Screen edges={['top', 'bottom']} statusBarColor={colors.white}>
      <AppBar
        eyebrow="Sample detail"
        title={sample.test_code || 'SAMPLE'}
        onBack={() => navigation.goBack()}
      />

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <AppText variant="mono" size={12.5} weight="bold" tracking={0.5} color={colors.greenDeep}>
            {sample.barcode}
          </AppText>
          <AppText
            variant="display"
            size={18}
            tracking={1}
            numberOfLines={2}
            style={styles.testName}>
            {sample.test_name}
          </AppText>
          <View style={styles.tags}>
            <Tag
              size="md"
              label={categoryWord(sample.category)}
              tone={categoryTone(sample.category)}
            />
            {sample.branch ? <Tag size="md" label={sample.branch} tone="branch" /> : null}
            {sample.std_tat_hours !== null ? (
              <Tag size="md" label={`SLA ${sample.std_tat_hours}H`} tone="sla" />
            ) : null}
          </View>
          {sample.department ? (
            <AppText variant="mono" size={10} tracking={0.5} style={styles.dept}>
              {sample.department}
              {sample.patient_name ? ` · ${sample.patient_name}` : ''}
            </AppText>
          ) : null}
        </View>

        <StatusCard tone={tone} eyebrow={eyebrow} value={value}>
          <AppText size={11.5} lineHeight={16} color={alpha.white90}>
            {note}
          </AppText>
        </StatusCard>

        <Timeline phases={phases} />
      </ScrollView>

      {/*
        Once escalated the ticket reference replaces the button — on a released
        sample too, since the ticket outlives the release. A released sample
        that was never escalated has nothing left to action, so no bar at all.
      */}
      {escalation ? (
        <ActionBar>
          <View style={styles.escalated}>
            <Ionicons
              name="checkmark-circle"
              size={ms(18)}
              color={colors.ok}
            />
            <View style={styles.escalatedText}>
              <AppText size={12.5} weight="extraBold" tracking={0.4} color={colors.ink}>
                Escalated · {escalation.ticket_code || 'ticket raised'}
              </AppText>
              <AppText variant="mono" size={9.5} tracking={0.4} uppercase color={colors.ink4}>
                {[escalation.phase, escalation.priority, escalation.raised_by]
                  .filter(Boolean)
                  .join(' · ')}
              </AppText>
            </View>
          </View>
        </ActionBar>
      ) : released ? null : (
        <ActionBar>
          <PrimaryAction
            label="⚠ Escalate to L2"
            onPress={() => setSheetOpen(true)}
          />
        </ActionBar>
      )}

      <EscalateSheet
        visible={sheetOpen}
        sample={sample}
        submitting={raising}
        onSubmit={raise}
        onClose={() => setSheetOpen(false)}
      />
    </Screen>
  );
};

const styles = ScaledSheet.create({
  hero: {
    paddingHorizontal: '18@s',
    paddingTop: '4@vs',
    paddingBottom: '16@vs',
    backgroundColor: colors.white,
    borderBottomWidth: '1@ms',
    borderBottomColor: colors.line,
  },
  testName: {marginTop: '4@vs', lineHeight: '23@ms'},
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: '6@s',
    marginTop: '10@vs',
  },
  dept: {marginTop: '8@vs'},
  escalated: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: '10@s',
    backgroundColor: colors.okTint,
    borderRadius: '12@ms',
    paddingHorizontal: '14@s',
    paddingVertical: '11@vs',
  },
  escalatedText: {flex: 1, minWidth: 0, gap: '2@vs'},
});

export default DetailScreen;
