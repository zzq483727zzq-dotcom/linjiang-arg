import { test } from 'node:test';
import { strict as assert } from 'node:assert';

test('node test runner is alive', () => {
  assert.equal(1 + 1, 2);
});
