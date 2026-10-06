export const LANDING_COPY = {
  practiceName: 'Northlight Family Practice',
  headline: 'The chart, before the patient walks in.',
  subheadline:
    'Northlight keeps every patient’s history, allergies, and notes one search away, so the front desk and the exam room read the same page.',
  callToAction: 'Open dashboard',
  closingLine: 'Ready when the next patient is.',
  valueProps: [
    {
      title: 'Find a patient',
      body: 'Type a name. The list narrows as you go, with status and last visit beside each name.',
    },
    {
      title: 'Read the chart',
      body: 'Conditions, allergies, and a plain-English summary built from the notes on file.',
    },
    {
      title: 'Write the note',
      body: 'Timestamped notes that advance the last visit and refresh the summary as you save.',
    },
  ],
} as const

export const SAMPLE_CARDS = [
  {
    name: 'Maria Alvarez',
    meta: '58 years, last visit 13 days ago',
    status: 'Active',
    tags: ['Type 2 diabetes', 'Hypertension'],
    note: 'A1c down to 7.1 from 7.8. Continue metformin.',
  },
  {
    name: 'Henry Caldwell',
    meta: '80 years, last visit 8 days ago',
    status: 'Active',
    tags: ['Atrial fibrillation', 'COPD'],
    note: 'Weight up 4 lb in a week. Furosemide increased for 5 days.',
  },
  {
    name: 'Daniel Whitfield',
    meta: '25 years, intake scheduled',
    status: 'Pending intake',
    tags: ['Peanut allergy'],
    note: 'Records requested from previous clinic.',
  },
] as const
