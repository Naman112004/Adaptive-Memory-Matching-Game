import { SessionRecord } from '../types';

const STORAGE_KEY = 'ps09_adaptive_memory_sessions_v1';

export function getStoredSessions(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Failed to parse stored sessions:', err);
    return [];
  }
}

export function saveSessionRecord(record: SessionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredSessions();
    const updated = [record, ...existing].slice(0, 50); // keep last 50 anonymous records
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Failed to save session:', err);
  }
}

export function clearStoredSessions(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear sessions:', err);
  }
}

export function exportSessionsAsJSON(): void {
  const sessions = getStoredSessions();
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sessions, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', `adaptive-memory-sessions-${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function exportSessionsAsCSV(): void {
  const sessions = getStoredSessions();
  if (sessions.length === 0) return;

  const headers = ['Date', 'Seed', 'Difficulty', 'Grid Size', 'Moves', 'Time (s)', 'Accuracy (%)', 'Efficiency (%)', 'Adaptation Action', 'Reason'];
  const rows = sessions.map(s => [
    `"${s.date}"`,
    `"${s.seed}"`,
    `"${s.difficultyName}"`,
    `"${s.gridSize}"`,
    s.moves,
    s.timeSeconds,
    s.accuracy,
    s.efficiency,
    `"${s.adaptation.action}"`,
    `"${s.adaptation.reason.replace(/"/g, '""')}"`
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', encodedUri);
  downloadAnchor.setAttribute('download', `adaptive-memory-sessions-${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
