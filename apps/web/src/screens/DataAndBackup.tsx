/**
 * Durability, kept secondary.
 *
 * Poseidon is meant to become a long-lived personal archive, so the record has
 * to be recoverable before it is trusted. Export and restore live here —
 * reachable, not prominent — alongside the unit preference and offline notes.
 */
import { useState, type ChangeEvent } from 'react';
import {
  Check,
  Database,
  Download,
  LogOut,
  Ruler,
  ShieldCheck,
  Upload,
  WifiOff,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import type { RestoreMode, RestorePreview } from '@poseidon/domain';

import { useOptionalAuth } from '../auth/AuthContext';
import {
  ACTION_QUIET,
  Card,
  Chip,
  QuietAction,
  SectionHeader,
  TopBar,
} from '../components/ui';
import { contentMeta } from '../data/content';
import { useLifetimeStats } from '../data/hooks';
import { usePoseidon } from '../data/provider';
import { pluralize, todayIso } from '../lib/format';
import { usePreferences } from '../lib/preferences';

export function DataAndBackup() {
  const navigate = useNavigate();
  const client = usePoseidon();
  const auth = useOptionalAuth();
  const { data: stats } = useLifetimeStats();
  const [preferences, setPreferences] = usePreferences();
  const [exported, setExported] = useState<string | null>(null);
  const [restorePayload, setRestorePayload] = useState<unknown | null>(null);
  const [restorePreview, setRestorePreview] = useState<RestorePreview | null>(
    null,
  );
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreStatus, setRestoreStatus] = useState<string | null>(null);
  const [restorePending, setRestorePending] = useState(false);

  const exportData = async () => {
    const payload = await client.store.exportData();
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `poseidon-export-${todayIso()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setExported(`${payload.personal.dives.length} dives exported`);
  };

  const selectBackup = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setRestoreError(null);
    setRestoreStatus(null);
    setRestorePayload(null);
    setRestorePreview(null);
    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      const preview = await client.store.previewRestore(parsed);
      setRestorePayload(parsed);
      setRestorePreview(preview);
    } catch (error) {
      setRestoreError(
        error instanceof Error
          ? error.message
          : 'Poseidon could not read this backup.',
      );
    }
  };

  const restore = async (mode: RestoreMode) => {
    if (restorePayload === null || restorePreview === null || restorePending)
      return;
    if (mode === 'replace') {
      const discardDives = restorePreview.replaceWouldDiscardDives;
      const discardCreatures = restorePreview.replaceWouldDiscardUserCreatures;
      const hasDiscard = discardDives > 0 || discardCreatures > 0;
      const warning = hasDiscard
        ? `Replace the current record with this backup? ${pluralize(discardDives, 'current dive')} and ${pluralize(discardCreatures, 'custom creature')} will be discarded because they are not identical in the backup. This cannot be undone unless you exported the current record first.`
        : 'Replace the current record with this backup? The backup will become the complete local record.';
      if (!window.confirm(warning)) return;
    }

    setRestorePending(true);
    setRestoreError(null);
    setRestoreStatus(null);
    try {
      const result = await client.mutate((store) =>
        store.restoreData(restorePayload, mode),
      );
      setRestoreStatus(
        mode === 'merge'
          ? `Merged safely: ${pluralize(result.addedDives, 'dive')} and ${pluralize(result.addedUserCreatures, 'custom creature')} added; current history kept.`
          : `Restored backup: ${pluralize(result.totalDives, 'dive')} and ${pluralize(result.totalUserCreatures, 'custom creature')} now on this device.`,
      );
      setRestorePreview(await client.store.previewRestore(restorePayload));
    } catch (error) {
      setRestoreError(
        error instanceof Error
          ? error.message
          : 'Poseidon refused this restore.',
      );
    } finally {
      setRestorePending(false);
    }
  };

  return (
    <div className="animate-rise pb-10">
      <TopBar title="Data & backup" onBack={() => navigate(-1)} />

      <section className="px-5">
        <SectionHeader title="Your record" />
        <Card className="p-5">
          <p className="text-sm leading-relaxed font-medium text-abyss/70">
            Poseidon keeps {pluralize(stats?.totalDives ?? 0, 'dive')} and{' '}
            {pluralize(stats?.distinctCreatures ?? 0, 'creature')} in the active
            record. Export a portable copy whenever you want an independent
            backup.
          </p>
          <div className="mt-4">
            <QuietAction type="button" onClick={exportData}>
              <Download size={18} aria-hidden="true" />
              Export everything as JSON
            </QuietAction>
          </div>
          {exported ? (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-success">
              <Check size={16} aria-hidden="true" />
              {exported}
            </p>
          ) : null}
        </Card>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Restore a backup" />
        <Card className="p-5">
          <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lagoon/12 text-abyss">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-abyss">
                Validated before anything changes
              </p>
              <p className="mt-1 text-sm leading-relaxed font-medium text-abyss/65">
                Choose a Poseidon JSON export. The file, schema version and
                every personal record are checked before restore actions become
                available.
              </p>
            </div>
          </div>

          <div className="mt-4">
            <input
              id="poseidon-restore-file"
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={selectBackup}
            />
            <label
              htmlFor="poseidon-restore-file"
              className={`${ACTION_QUIET} cursor-pointer`}
            >
              <Upload size={18} aria-hidden="true" />
              Choose Poseidon backup
            </label>
          </div>

          {restoreError ? (
            <p
              role="alert"
              className="mt-3 rounded-field bg-coral-soft px-4 py-3 text-sm leading-relaxed font-bold text-coral"
            >
              Restore refused: {restoreError}
            </p>
          ) : null}
          {restoreStatus ? (
            <p
              role="status"
              className="mt-3 flex items-start gap-2 rounded-field bg-lagoon/10 px-4 py-3 text-sm leading-relaxed font-bold text-success"
            >
              <Check size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {restoreStatus}
            </p>
          ) : null}

          {restorePreview ? (
            <div className="mt-5 border-t border-aqua-soft pt-4">
              <p className="text-sm font-bold text-abyss">
                Backup contains {pluralize(restorePreview.backupDives, 'dive')}{' '}
                and{' '}
                {pluralize(
                  restorePreview.backupUserCreatures,
                  'custom creature',
                )}
                .
              </p>
              <p className="mt-1 text-xs leading-relaxed font-medium text-abyss/55">
                Exported {new Date(restorePreview.exportedAt).toLocaleString()}{' '}
                · export v{restorePreview.exportVersion} · data schema v
                {restorePreview.schemaVersion}
              </p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-field border border-aqua-soft bg-aqua-soft/35 p-4">
                  <p className="text-sm font-black text-abyss">
                    Merge — keep current history
                  </p>
                  <p className="mt-1 text-xs leading-relaxed font-medium text-abyss/60">
                    Adds {pluralize(restorePreview.mergeAddsDives, 'new dive')}{' '}
                    and{' '}
                    {pluralize(
                      restorePreview.mergeAddsUserCreatures,
                      'new custom creature',
                    )}
                    . Current records are never deleted; identical records are
                    skipped.
                  </p>
                  {restorePreview.mergeConflicts.length > 0 ? (
                    <p className="mt-2 text-xs leading-relaxed font-bold text-coral">
                      Merge unavailable: {restorePreview.mergeConflicts[0]}
                      {restorePreview.mergeConflicts.length > 1
                        ? ` (+${restorePreview.mergeConflicts.length - 1} more)`
                        : ''}
                      .
                    </p>
                  ) : null}
                  <QuietAction
                    type="button"
                    className="mt-3"
                    disabled={
                      restorePending || restorePreview.mergeConflicts.length > 0
                    }
                    onClick={() => restore('merge')}
                  >
                    Merge backup safely
                  </QuietAction>
                </div>

                <div className="rounded-field border border-coral/20 bg-coral-soft/35 p-4">
                  <p className="text-sm font-black text-abyss">
                    Replace — use backup exactly
                  </p>
                  <p className="mt-1 text-xs leading-relaxed font-medium text-abyss/60">
                    Replaces the complete local record.{' '}
                    {pluralize(
                      restorePreview.replaceWouldDiscardDives,
                      'current dive',
                    )}{' '}
                    and{' '}
                    {pluralize(
                      restorePreview.replaceWouldDiscardUserCreatures,
                      'custom creature',
                    )}{' '}
                    would be discarded because they are not identical in the
                    backup. You will be asked to confirm.
                  </p>
                  <QuietAction
                    type="button"
                    className="mt-3 border-coral/25 text-coral"
                    disabled={restorePending}
                    onClick={() => restore('replace')}
                  >
                    Replace current record
                  </QuietAction>
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Depth units" />
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua-soft text-marine">
            <Ruler size={20} aria-hidden="true" />
          </span>
          <p className="flex-1 text-sm font-medium text-abyss/70">
            Used when you log a new dive.
          </p>
          <div className="flex gap-2">
            <Chip
              selected={preferences.depthUnit === 'm'}
              onClick={() => setPreferences({ depthUnit: 'm' })}
            >
              m
            </Chip>
            <Chip
              selected={preferences.depthUnit === 'ft'}
              onClick={() => setPreferences({ depthUnit: 'ft' })}
            >
              ft
            </Chip>
          </div>
        </Card>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Offline" />
        <Card className="flex items-start gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua-soft text-marine">
            <WifiOff size={20} aria-hidden="true" />
          </span>
          <p className="text-sm leading-relaxed font-medium text-abyss/70">
            Logging and browsing work with no network at all. The app shell, the
            creature artwork and the marine content pack are stored on the
            device after your first visit.
          </p>
        </Card>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Marine content" />
        <Card className="flex items-start gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-aqua-soft text-marine">
            <Database size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 text-sm leading-relaxed font-medium text-abyss/70">
            <p className="font-bold text-abyss">{contentMeta.name}</p>
            <p className="mt-1">
              {contentMeta.creatureCount} creatures (
              {contentMeta.curatedArtworkCount} illustrated),{' '}
              {contentMeta.siteCount} dive sites, from{' '}
              {pluralize(contentMeta.sourceCount, 'source')}. Reviewed{' '}
              {contentMeta.lastReviewed}.
            </p>
            <p className="mt-2 text-xs text-abyss/50">
              Curated content improves suggestions. It never limits what you can
              log.
            </p>
          </div>
        </Card>
      </section>

      {auth?.user ? (
        <section className="mt-7 px-5">
          <SectionHeader title="Account" />
          <Card className="p-5">
            <p className="text-sm leading-relaxed font-medium text-abyss/70">
              Signed in as{' '}
              <span className="font-bold text-abyss">{auth.user.email}</span>.
            </p>
            <div className="mt-4">
              <QuietAction
                type="button"
                onClick={() => void auth.signOutUser()}
              >
                <LogOut size={18} aria-hidden="true" />
                Sign out
              </QuietAction>
            </div>
          </Card>
        </section>
      ) : null}
    </div>
  );
}
