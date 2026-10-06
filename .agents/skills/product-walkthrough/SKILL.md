---
name: product-walkthrough
description: Scripted usability journeys for a front-desk coordinator and a clinician on the healthcare dashboard. Use when judging whether a flow is understandable.
---

# Product walkthrough

Walk these journeys against the running app or, if it is not running, against the route and component code. Note empty, loading, and error copy.

1. Coordinator opens `/`, sees how many patients need attention, and continues to `/patients`.
2. Coordinator searches by last name. The field stays responsive while results update. Clearing the search restores the list.
3. Coordinator filters by status and sorts by last visit.
4. Coordinator opens a patient, reads the summary, and adds a note with the visit time and what was discussed.
5. Coordinator deletes a note that was entered on the wrong chart and sees the list update.
6. Coordinator starts a new patient, leaves the email blank, and sees a field error without losing the other answers.
7. Coordinator edits a date of birth to a future date and sees the server message on that field.
8. With the API stopped, the list explains the failure and offers retry. Filling the form does not pretend the save succeeded.
9. Clinician reads conditions, allergies, and blood type before the narrative, and can scan note timestamps in order.
10. A new visitor on `/welcome` sees one call to action and lands on `/`.

Friction is a blocked journey, ambiguous copy, or a state that does not say what to do next.
