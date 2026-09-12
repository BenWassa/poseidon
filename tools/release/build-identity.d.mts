export interface BuildIdentity {
  productVersion: string;
  buildRevision: string;
}

export function getBuildIdentity(): BuildIdentity;
