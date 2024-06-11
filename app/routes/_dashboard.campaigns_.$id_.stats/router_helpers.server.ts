
export const calculateBouncedSteps = ({
  db,
  campaignId,
}: {
  db: DrizzleDb;
  campaignId: number;
}) => {
  const boundedSteps = db
    .select()
    .from(TB_sequence_steps)
    .where(
      and(
        ...[
          eq(TB_sequence_steps.campaignId, campaignId),
          eq(TB_sequence_steps.state, "bounced"),
        ],
      ),
    );
  const sentSteps = db
    .select()
    .from(TB_sequence_steps)
    .where(
      and(
        ...[
          eq(TB_sequence_steps.campaignId, campaignId),
          eq(TB_sequence_steps.state, "sent"),
        ],
      ),
    );

  const delivarabilityPromise = Promise.all([boundedSteps, sentSteps]).then(
    (value) => {
      const [bounced, sent] = value;
      const boundedSteps = bounced.length;
      const sentSteps = sent.length;
      const deliverability =
        boundedSteps + sentSteps
          ? 1 - boundedSteps / (boundedSteps + sentSteps)
          : 0;
      return deliverability;
    },
  );
  return delivarabilityPromise;
};

export const openRateCalucalte = ({
  db,
  campaignId,
}: {
  db: DrizzleDb;
  campaignId: number;
}) => {
  const sentSteps = db
    .select()
    .from(TB_sequence_steps)
    .where(
      and(
        ...[
          eq(TB_sequence_steps.campaignId, campaignId),
          eq(TB_sequence_steps.state, "sent"),
        ],
      ),
    )
    .then((v) => v.length); //.length;

  const openedCount = db
    .select()
    .from(TB_sequence_steps)
    .where(and(...[eq(TB_sequence_steps.campaignId, campaignId)]))
    .leftJoin(
      TB_email_open_event,
      eq(TB_email_open_event.sequenceStepId, TB_sequence_steps.id),
    )
    .then((v) => v.filter((i) => i.email_open_event).length);
  const contactsCount = db
    .select()
    .from(TB_binding_campaigns_contacts)
    .where(eq(TB_binding_campaigns_contacts.campaignId, campaignId))
    .then((v) => v.length);

  const maxContactsOpened = Promise.all([sentSteps, contactsCount]).then(
    ([sentSteps, contactsCount]) => sentSteps * contactsCount,
  );

  const openRate = Promise.all([maxContactsOpened, openedCount]).then(
    ([maxContactsOpened, openedCount]) =>
      maxContactsOpened ? openedCount / maxContactsOpened : 0,
  );
  return openRate;
};

export const ctrCalculate = ({
  db,
  campaignId,
}: {
  db: DrizzleDb;
  campaignId: number;
}) => {
  const abc = db
    .select({
      seq_id: TB_email_link_click_event.sequenceStepId,
      count:
        sql<number>`count(distinct ${TB_email_link_click_event.targetEmail})`.mapWith(
          Number,
        ),
    })
    .from(TB_sequence_steps)
    .leftJoin(
      TB_email_link_click_event,
      eq(TB_email_link_click_event.sequenceStepId, TB_sequence_steps.id),
    )
    .where(eq(TB_sequence_steps.campaignId, campaignId))
    .groupBy(TB_email_link_click_event.sequenceStepId);

  const totalCountOfUserSequencePairings = abc.then((value) =>
    value.map((i) => i.count).reduce((prev, curr) => prev + curr),
  );

  const contactsCount = db
    .select()
    .from(TB_binding_campaigns_contacts)
    .where(eq(TB_binding_campaigns_contacts.campaignId, campaignId))
    .then((v) => v.length);

  const sentSteps = db
    .select()
    .from(TB_sequence_steps)
    .where(
      and(
        ...[
          eq(TB_sequence_steps.campaignId, campaignId),
          eq(TB_sequence_steps.state, "sent"),
        ],
      ),
    )
    .then((v) => v.length); //.length;

  const maxContactsOpened = Promise.all([sentSteps, contactsCount]).then(
    ([sentSteps, contactsCount]) => {
      return sentSteps * contactsCount;
    },
  );

  const clickThroughRate = Promise.all([
    maxContactsOpened,
    totalCountOfUserSequencePairings,
  ]).then(([maxContactsOpened, totalCountOfUserSequencePairings]) =>
    maxContactsOpened
      ? totalCountOfUserSequencePairings / maxContactsOpened
      : 0,
  );

  return clickThroughRate;
};

export const optOutCalculate = ({
  db,
  campaignId,
}: {
  db: DrizzleDb;
  campaignId: number;
}) => {
  const unsubbedContactsCount = db
    .select()
    .from(TB_email_opt_out_event)
    .where(eq(TB_email_opt_out_event.campaignId, campaignId))
    .then((r) => r.length);

  const totalContactsCount = db
    .select()
    .from(TB_binding_campaigns_contacts)
    .leftJoin(TB_sequence_steps, eq(TB_sequence_steps.campaignId, campaignId))
    .where(eq(TB_binding_campaigns_contacts.campaignId, campaignId))
    .then((v) => v.length);

  const clickThroughRate = Promise.all([
    unsubbedContactsCount,
    totalContactsCount,
  ]).then(([unsubbedContactsCount, totalContactsCount]) =>
    totalContactsCount ? unsubbedContactsCount / totalContactsCount : 0,
  );

  return clickThroughRate;
};
