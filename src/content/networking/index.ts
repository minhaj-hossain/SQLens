import { NetworkingModule } from '@/types/networking';
import { NET_01_MODULE } from './modules/net-01';
import { NET_02_MODULE } from './modules/net-02';
import { NET_03_MODULE } from './modules/net-03';
import { NETWORKING_ROADMAP_STAGES } from './roadmap';

export const NETWORKING_MODULES: Record<string, NetworkingModule> = {
  'net-01': NET_01_MODULE,
  'net-02': NET_02_MODULE,
  'net-03': NET_03_MODULE,
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
  return [NET_01_MODULE, NET_02_MODULE, NET_03_MODULE];
}

export { NET_01_MODULE, NET_02_MODULE, NET_03_MODULE, NETWORKING_ROADMAP_STAGES };
