import { useState } from 'react';
import { UserRound } from 'lucide-react';

export function ProfileAvatar({
  photoURL,
  size = 21,
}: {
  photoURL?: string | null | undefined;
  size?: number;
}) {
  const [failedURL, setFailedURL] = useState<string | null>(null);
  return photoURL && photoURL !== failedURL ? (
    <img
      src={photoURL}
      alt=""
      referrerPolicy="no-referrer"
      className="h-full w-full object-cover"
      onError={() => setFailedURL(photoURL)}
    />
  ) : (
    <UserRound size={size} aria-hidden="true" />
  );
}
