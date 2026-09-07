/**
 * Durability, kept secondary.
 *
 * Poseidon is meant to become a long-lived personal archive, so the record has
 * to be recoverable before it is trusted. Export is here — reachable, not
 * prominent — alongside the unit preference and what the app knows offline.
 */
import { useState } from 'react';
import { Check, Database, Download, Ruler, WifiOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Card, Chip, QuietAction, SectionHeader, TopBar } from '../components/ui';
import { contentMeta } from '../data/content';
import { useLifetimeStats } from '../data/hooks';
import { usePoseidon } from '../data/provider';
import { usePreferences } from '../lib/preferences';
import { pluralize, todayIso } from '../lib/format';

export function DataAndBackup() {
  const navigate = useNavigate();
  const client = usePoseidon();
  const { data: stats } = useLifetimeStats();
  const [preferences, setPreferences] = usePreferences();
  const [exported, setExported] = useState<string | null>(null);

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

  return (
    <div className="animate-rise pb-10">
      <TopBar title="Data & backup" onBack={() => navigate(-1)} />

      <section className="px-5">
        <SectionHeader title="Your record" />
        <Card className="p-5">
          <p className="text-sm font-medium leading-relaxed text-ocean/70">
            Poseidon keeps {pluralize(stats?.totalDives ?? 0, 'dive')} and{' '}
            {pluralize(stats?.distinctCreatures ?? 0, 'creature')} on this device. Nothing is uploaded, and no
            account is required.
          </p>
          <div className="mt-4">
            <QuietAction type="button" onClick={exportData}>
              <Download size={18} aria-hidden="true" />
              Export everything as JSON
            </QuietAction>
          </div>
          {exported ? (
            <p className="mt-3 flex items-center justify-center gap-1.5 text-sm font-bold text-reef">
              <Check size={16} aria-hidden="true" />
              {exported}
            </p>
          ) : null}
        </Card>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Depth units" />
        <Card className="flex items-center gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shallows text-marine">
            <Ruler size={20} aria-hidden="true" />
          </span>
          <p className="flex-1 text-sm font-medium text-ocean/70">Used when you log a new dive.</p>
          <div className="flex gap-2">
            <Chip selected={preferences.depthUnit === 'm'} onClick={() => setPreferences({ depthUnit: 'm' })}>
              m
            </Chip>
            <Chip selected={preferences.depthUnit === 'ft'} onClick={() => setPreferences({ depthUnit: 'ft' })}>
              ft
            </Chip>
          </div>
        </Card>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Offline" />
        <Card className="flex items-start gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shallows text-marine">
            <WifiOff size={20} aria-hidden="true" />
          </span>
          <p className="text-sm font-medium leading-relaxed text-ocean/70">
            Logging and browsing work with no network at all. The app shell, the creature artwork and the
            marine content pack are stored on the device after your first visit.
          </p>
        </Card>
      </section>

      <section className="mt-7 px-5">
        <SectionHeader title="Marine content" />
        <Card className="flex items-start gap-4 p-5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-shallows text-marine">
            <Database size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0 text-sm font-medium leading-relaxed text-ocean/70">
            <p className="font-bold text-ocean">{contentMeta.name}</p>
            <p className="mt-1">
              {contentMeta.creatureCount} creatures ({contentMeta.curatedArtworkCount} illustrated),{' '}
              {contentMeta.siteCount} dive sites, from {pluralize(contentMeta.sourceCount, 'source')}. Reviewed{' '}
              {contentMeta.lastReviewed}.
            </p>
            <p className="mt-2 text-xs text-ocean/50">
              Curated content improves suggestions. It never limits what you can log.
            </p>
          </div>
        </Card>
      </section>
    </div>
  );
}
