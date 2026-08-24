# NOVA Evaluation Notes

The project documentation reports 15 functional scenarios covering booking, cancellation, rescheduling, invalid slots, ambiguity, urgency, silence handling and escalation.

Reported results:

| Metric | Result |
|---|---:|
| Interaction accuracy | 81% |
| Precision | 0.86 |
| Recall | 0.79 |
| F1-score | 0.82 |
| Booking F1 | 0.86 |
| Cancellation F1 | 0.80 |
| Rescheduling F1 | 0.83 |

These are project-level evaluation figures from the documented test set, not a production benchmark.

## Known limitations

- Cloud AI services are required for the intended production flow.
- The current reference scheduling model uses a shared appointment grid.
- The documented voice interaction is English-first.
- The reference flow is turn-based rather than full-duplex real-time conversation.
- Persistent memory across separate calls is not implemented in this reference repository.
