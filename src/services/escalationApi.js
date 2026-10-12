import api from './api';

/**
 * POST /escalations — raises a TrustTicket helpdesk ticket for one sample.
 *
 * The endpoint takes no token (the app carries no helpdesk identity), so
 * `raisedBy` is what names the person on the ticket. Every field except the
 * sample id is optional: the server composes the title, the body and the
 * priority from the sample when they're left out.
 *
 * Resolves to the escalation record. A sample that has already been escalated
 * comes back as a 409 whose payload carries the original one — the caller
 * should treat that as success, not failure.
 */
export const raiseEscalationRequest = async ({
  sampleId,
  dataset = 'processing',
  title,
  description,
  priority,
  raisedBy,
  phaseKey,
}) => {
  const {data} = await api.post('/escalations', {
    sample_id: sampleId,
    dataset,
    title: title || undefined,
    description: description || undefined,
    priority: priority || undefined,
    raised_by: raisedBy || undefined,
    // Which workflow stage the delay is pinned on. Omitted, the server falls
    // back to whichever stage the sample hasn't cleared.
    phase_key: phaseKey || undefined,
  });

  return data.escalation;
};

/** The escalation carried on a 409, or null if the error was something else. */
export const existingEscalationFrom = error =>
  error?.response?.status === 409 ? error.response.data?.escalation ?? null : null;
