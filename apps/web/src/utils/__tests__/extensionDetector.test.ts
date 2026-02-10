import { cleanupShadowHost,createShadowHost } from '@test/mocks/dom';
import { afterEach,describe, expect, it } from 'vitest';

import { checkExtensionActive } from '../extensionDetector';

const SHADOW_HOST_ID = 'wandok-shadow-host';

describe('checkExtensionActive', () => {
  afterEach(() => {
    cleanupShadowHost(SHADOW_HOST_ID);
  });

  it('Shadow host가 존재하면 true를 반환해야 한다', () => {
    createShadowHost(SHADOW_HOST_ID);

    expect(checkExtensionActive()).toBe(true);
  });

  it('Shadow host가 존재하지 않으면 false를 반환해야 한다', () => {
    expect(checkExtensionActive()).toBe(false);
  });
});
