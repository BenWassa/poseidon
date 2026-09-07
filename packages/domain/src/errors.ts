export class PoseidonValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PoseidonValidationError';
  }
}

export class PoseidonNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PoseidonNotFoundError';
  }
}

export class PoseidonPersistenceError extends Error {
  readonly causeValue: unknown;

  constructor(message: string, causeValue?: unknown) {
    super(message);
    this.name = 'PoseidonPersistenceError';
    this.causeValue = causeValue;
  }
}

export class PoseidonMigrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PoseidonMigrationError';
  }
}
