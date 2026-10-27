import { NetworkingModule } from '@/types/networking';
import { NET_01_MODULE } from './modules/net-01';
import { NET_02_MODULE } from './modules/net-02';
import { NET_03_MODULE } from './modules/net-03';
import { NET_04_MODULE } from './modules/net-04';
import { NET_05_MODULE } from './modules/net-05';
import { NET_06_MODULE } from './modules/net-06';
import { NET_07_MODULE } from './modules/net-07';
import { NET_08_MODULE } from './modules/net-08';
import { NET_09_MODULE } from './modules/net-09';
import { NET_10_MODULE } from './modules/net-10';
import { NET_11_MODULE } from './modules/net-11';
import { NET_12_MODULE } from './modules/net-12';
import { NETWORKING_ROADMAP_STAGES } from './roadmap';

export const NETWORKING_MODULES: Record<string, NetworkingModule> = {
  'net-01': NET_01_MODULE,
  'net-02': NET_02_MODULE,
  'net-03': NET_03_MODULE,
  'net-04': NET_04_MODULE,
  'net-05': NET_05_MODULE,
  'net-06': NET_06_MODULE,
  'net-07': NET_07_MODULE,
  'net-08': NET_08_MODULE,
  'net-09': NET_09_MODULE,
  'net-10': NET_10_MODULE,
  'net-11': NET_11_MODULE,
  'net-12': NET_12_MODULE,
};

export function getNetworkingModule(
  idOrDay: string | number
): NetworkingModule | undefined {
  if (typeof idOrDay === 'number') {
    const key = `net-${String(idOrDay).padStart(2, '0')}`;
    return NETWORKING_MODULES[key];
  }
  const normalized = idOrDay.toLowerCase();
  return (
    NETWORKING_MODULES[normalized] ||
    Object.values(NETWORKING_MODULES).find(
      (m) =>
        m.id === normalized ||
        m.dayNumber === parseInt(normalized.replace(/\D/g, ''), 10)
    )
  );
}

export function getAllNetworkingModules(): NetworkingModule[] {
  return [
    NET_01_MODULE,
    NET_02_MODULE,
    NET_03_MODULE,
    NET_04_MODULE,
    NET_05_MODULE,
    NET_06_MODULE,
    NET_07_MODULE,
    NET_08_MODULE,
    NET_09_MODULE,
    NET_10_MODULE,
    NET_11_MODULE,
    NET_12_MODULE,
  ];
}

export {
  NET_01_MODULE,
  NET_02_MODULE,
  NET_03_MODULE,
  NET_04_MODULE,
  NET_05_MODULE,
  NET_06_MODULE,
  NET_07_MODULE,
  NET_08_MODULE,
  NET_09_MODULE,
  NET_10_MODULE,
  NET_11_MODULE,
  NET_12_MODULE,
  NETWORKING_ROADMAP_STAGES,
};

