import re

with open('apps/desktop/src/features/study/views/StudyView.tsx', 'r') as f:
    sv = f.read()

# Remove early unit usage
sv = sv.replace('''
  useEffect(() => {
    if (unit?.notes) {
      try {
        const parsed = typeof unit.notes === 'string' ? JSON.parse(unit.notes) : unit.notes;
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      } catch (e) {}
    }
  }, [unit?.notes]);
''', '')

# Insert after unit is declared
sv = sv.replace('''  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

  // Progress Tracking Hook''', '''  const unit = activeTrack?.track?.units?.find((u) => u.id === unitId);

  useEffect(() => {
    if (unit?.notes) {
      try {
        const parsed = typeof unit.notes === 'string' ? JSON.parse(unit.notes) : unit.notes;
        if (Array.isArray(parsed)) {
          setNotes(parsed);
        }
      } catch (e) {}
    }
  }, [unit?.notes]);

  // Progress Tracking Hook''')

with open('apps/desktop/src/features/study/views/StudyView.tsx', 'w') as f:
    f.write(sv)
