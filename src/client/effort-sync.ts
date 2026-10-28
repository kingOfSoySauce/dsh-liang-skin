interface Selection {
  key: string;
  mode: string;
  frame: number;
  fine: boolean;
}

/** Preserve a local fine stop for one acknowledgement, then follow the host.
 * Keys include provider, model and the ordered effort IDs, never just an index.
 */
export function createEffortSync() {
  let observed: Selection | null = null;
  let submitted: { key: string; from: string; mode: string } | null = null;
  return {
    submit(key: string, from: string, mode: string) {
      submitted = { key, from, mode };
    },
    reset() { submitted = null; },
    observe(next: Selection): number | null {
      const changedMode = observed?.mode !== next.mode;
      if (changedMode) submitted = null;
      if (next.fine && submitted?.mode === next.mode) {
        if (submitted.key === next.key) {
          submitted = null;
          observed = next;
          return null;
        }
        // select() can finish before its observable catches up. Only keep the
        // old selection while it is exactly the one this submission replaced.
        if (submitted.from === next.key && observed?.key === next.key) return null;
        submitted = null;
      }
      const changed = changedMode || observed?.key !== next.key;
      observed = next;
      return !next.fine || changed ? next.frame : null;
    },
  };
}
