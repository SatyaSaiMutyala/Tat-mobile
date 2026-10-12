import React from 'react';

import SampleCard from './SampleCard';
import {categoryLabel, categoryTone} from '../utils/category';
import {fmtAge, fmtDateTime, fmtTimeRemaining} from '../utils/format';

const stamp = iso => (iso ? fmtDateTime(new Date(iso).getTime()) : '—');

const dayLabel = days => {
  if (days === null || days === undefined) {
    return null;
  }
  if (days <= 1) {
    return '1 day';
  }
  if (days < 7) {
    return `${days} days`;
  }
  if (days < 14) {
    return '1 wk';
  }
  if (days < 21) {
    return '2 wk';
  }
  if (days < 28) {
    return '3 wk';
  }
  return `${Math.floor(days / 30)} mo`;
};

/**
 * A single API sample rendered as a list row.
 *
 * Memoised and given a stable `onOpen(id)` instead of a per-row closure, so
 * appending a page leaves the existing rows untouched.
 *
 * `variant`: 'today' (time to deadline) | 'overdue' (how late it is)
 */
const SampleRow = ({item, onOpen, variant = 'today'}) => {
  const remaining = item.remaining_minutes ?? 0;
  const past = remaining < 0;

  if (variant === 'overdue') {
    const stale = (item.days_late ?? 0) >= 28;
    const aged = (item.days_late ?? 0) >= 7;

    return (
      <SampleCard
        tone={stale ? 'stale' : 'past'}
        code={item.barcode}
        tags={[
          {label: categoryLabel(item.category), tone: categoryTone(item.category)},
          {
            label: dayLabel(item.days_late) || '—',
            tone: stale ? 'stale' : aged ? 'aged' : 'crit',
          },
        ]}
        testName={item.test_name}
        meta={`${item.branch} · SLA ${item.std_tat_hours ?? '—'}H · Due ${stamp(
          item.deadline_at,
        )}`}
        timeLabel={`${fmtAge(Math.abs(remaining))} OVER`}
        phase={`STUCK · ${item.phase}`}
        onPress={() => onOpen(item.id)}
      />
    );
  }

  const tight = !past && remaining < 60;

  return (
    <SampleCard
      tone={past ? 'past' : tight ? 'tight' : 'ok'}
      code={item.barcode}
      tags={[{label: categoryLabel(item.category), tone: categoryTone(item.category)}]}
      testName={item.test_name}
      meta={`${item.branch} · SRA ${stamp(item.sra_at)} · Due ${stamp(item.deadline_at)}`}
      timeLabel={`${past ? '−' : ''}${fmtTimeRemaining(remaining)} ${past ? 'OVER' : 'LEFT'}`}
      phase={item.phase}
      onPress={() => onOpen(item.id)}
    />
  );
};

export default React.memo(SampleRow);
