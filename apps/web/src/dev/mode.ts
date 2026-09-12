export function isMockMode(dev: boolean, mode: string): boolean {
  return dev && mode === 'mock';
}
