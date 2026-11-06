import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Firestore Security Rules Structure', () => {
  const rulesPath = path.join(process.cwd(), 'firestore.rules');
  const rulesContent = fs.readFileSync(rulesPath, 'utf-8');

  it('contains rules_version 2', () => {
    expect(rulesContent).toContain("rules_version = '2';");
  });

  it('contains default deny rule', () => {
    expect(rulesContent).toContain('match /{document=**} {');
    expect(rulesContent).toContain('allow read, write: if false;');
  });

  it('removes unconditional public writes (|| true or if true on writes)', () => {
    expect(rulesContent).not.toContain('allow write: if true;');
    expect(rulesContent).not.toContain('allow read, write, create, update, delete: if true;');
    expect(rulesContent).not.toContain('|| true;');
  });

  it('protects audit_logs from modification or deletion', () => {
    expect(rulesContent).toContain('match /audit_logs/{logId}');
    expect(rulesContent).toContain('allow update, delete: if false;');
  });

  it('enforces schema validation on public_orders', () => {
    expect(rulesContent).toContain('isValidPublicOrder');
    expect(rulesContent).toContain('allow create: if isValidPublicOrder(incoming());');
  });

  it('restricts administrative actions to isAdmin()', () => {
    expect(rulesContent).toContain('function isAdmin()');
    expect(rulesContent).toContain('match /products/{productId}');
    expect(rulesContent).toContain('allow write, create, update, delete: if isAdmin();');
  });
});
