import type { ReactNode } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

import { AppShell } from './components/AppShell';
import { Atlas } from './screens/Atlas';
import { Collection } from './screens/Collection';
import { CreatureDetail } from './screens/CreatureDetail';
import { DataAndBackup } from './screens/DataAndBackup';
import { DiveDetail } from './screens/DiveDetail';
import { Home } from './screens/Home';
import { Journal } from './screens/Journal';
import { LogDive } from './screens/LogDive';
import { PlaceDetail } from './screens/PlaceDetail';

export function App({ devAssetReview }: { devAssetReview?: ReactNode }) {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/journal/:diveId" element={<DiveDetail />} />
        <Route path="/journal/:diveId/edit" element={<LogDive mode="edit" />} />
        <Route path="/log" element={<LogDive mode="create" />} />
        <Route path="/atlas" element={<Atlas />} />
        <Route path="/atlas/:placeKey" element={<PlaceDetail />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/collection/:creatureId" element={<CreatureDetail />} />
        <Route path="/profile" element={<DataAndBackup />} />
        <Route path="/data" element={<Navigate to="/profile" replace />} />
        {devAssetReview ? (
          <Route path="/dev/assets" element={devAssetReview} />
        ) : null}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  );
}
