import type { TranslationKey } from '../../core/i18n/catalogs';
import type { GuestGuideDetailKind } from '../../domain/guest-guide';
import type { IconName } from '../../shared/ui';

export type GuestGuideSectionId = 'before' | 'during' | 'essential' | 'environment' | 'profile';

export interface GuestGuideNavItem {
  readonly id: GuestGuideSectionId;
  readonly label: TranslationKey;
  readonly icon: IconName;
  readonly fragment: string;
}

export const GUEST_GUIDE_NAV_ITEMS: readonly GuestGuideNavItem[] = [
  { id: 'before', label: 'guest.nav.before', icon: 'door', fragment: 'guide-before' },
  {
    id: 'during',
    label: 'guest.nav.during',
    icon: 'luggage',
    fragment: 'guide-during',
  },
  {
    id: 'essential',
    label: 'guest.nav.essential',
    icon: 'star',
    fragment: 'guide-essential',
  },
  {
    id: 'environment',
    label: 'guest.nav.environment',
    icon: 'map-pin',
    fragment: 'recommendations-map',
  },
  {
    id: 'profile',
    label: 'guest.nav.profile',
    icon: 'user',
    fragment: 'guide-profile',
  },
];

const DETAIL_SECTION: Readonly<Record<GuestGuideDetailKind, GuestGuideSectionId>> = {
  'check-in': 'before',
  'home-access': 'before',
  'home-address': 'before',
  luggage: 'before',
  parking: 'before',
  internet: 'during',
  'home-care': 'during',
  'house-rules': 'during',
  extras: 'during',
  checkout: 'during',
  help: 'essential',
  'local-guide': 'environment',
  transport: 'environment',
};

export function sectionForDetail(kind: GuestGuideDetailKind): GuestGuideSectionId {
  return DETAIL_SECTION[kind];
}

export function sectionForFragment(fragment: string | null): GuestGuideSectionId {
  return GUEST_GUIDE_NAV_ITEMS.find((item) => item.fragment === fragment)?.id ?? 'before';
}
