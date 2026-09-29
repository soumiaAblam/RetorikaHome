import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import type { TranslationKey } from '../../core/i18n/catalogs';
import type {
  GuestGuideDetailDto,
  GuestGuideDetailKind,
  GuestNearbyServiceDto,
} from '../../domain/guest-guide';
import type { AccessMethod, NearbyServiceCategory, RulePolicy } from '../../domain/property';
import { MapLocationParser } from '../../shared/map';
import { UiIconComponent, type IconName } from '../../shared/ui';
import { GuestChecklistStore } from './guest-checklist.store';
import { GuestCopyService, type GuestCopyKey } from './guest-copy.service';
import { GuestGuideFacade } from './guest-guide.facade';
import { GuestUnavailableComponent } from './guest-unavailable.component';
import { GuestInfoBlockComponent } from './guest-info-block.component';
import { GuestExtraCardComponent } from './guest-extra-card.component';

interface DetailPresentation {
  readonly titleKey: Parameters<I18nService['translate']>[0];
  readonly icon: IconName;
  readonly tone: 'blue' | 'green' | 'pink' | 'purple' | 'yellow';
}

interface AddressMap {
  readonly externalUrl: string;
  readonly embedUrl: SafeResourceUrl;
}

const PRESENTATIONS: Readonly<Record<GuestGuideDetailKind, DetailPresentation>> = {
  'check-in': { titleKey: 'guest.checkIn', icon: 'door', tone: 'blue' },
  'home-access': { titleKey: 'guest.homeAccess', icon: 'key', tone: 'green' },
  'home-address': { titleKey: 'guest.homeAddress', icon: 'map-pin', tone: 'purple' },
  luggage: { titleKey: 'guest.luggage', icon: 'luggage', tone: 'yellow' },
  parking: { titleKey: 'guest.parking', icon: 'parking', tone: 'blue' },
  internet: { titleKey: 'guest.internet', icon: 'wifi', tone: 'blue' },
  'home-care': { titleKey: 'guest.homeCare', icon: 'home-care', tone: 'yellow' },
  'house-rules': { titleKey: 'guest.houseInstructions', icon: 'list', tone: 'green' },
  help: { titleKey: 'guest.emergencies', icon: 'emergency', tone: 'pink' },
  'local-guide': { titleKey: 'guest.localGuide', icon: 'map-pin', tone: 'purple' },
  transport: { titleKey: 'guest.transport', icon: 'bus', tone: 'blue' },
  extras: { titleKey: 'guest.extras', icon: 'sparkles', tone: 'pink' },
  checkout: { titleKey: 'guest.checkout', icon: 'checkout', tone: 'green' },
};

const SEVILLA_FIXTURE_DIRECTIONS =
  'Sigue las señales azules después de entrar en Calle La Sevillana.';

@Component({
  selector: 'app-guest-guide-detail-page',
  imports: [
    GuestExtraCardComponent,
    GuestInfoBlockComponent,
    GuestUnavailableComponent,
    RouterLink,
    UiIconComponent,
  ],
  templateUrl: './guest-guide-detail.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestGuideDetailPage {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(GuestGuideFacade);
  private readonly mapParser = inject(MapLocationParser);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly checklistStore = inject(GuestChecklistStore);
  protected readonly i18n = inject(I18nService);
  protected readonly copy = inject(GuestCopyService);
  protected readonly propertyId = this.route.snapshot.parent?.paramMap.get('propertyId') ?? '';
  protected readonly kind = this.route.snapshot.data['kind'] as GuestGuideDetailKind;
  protected readonly presentation = PRESENTATIONS[this.kind];
  protected readonly accessRevealed = signal(false);
  protected readonly addressCopied = signal(false);
  protected readonly locationPreviewOpen = signal(false);
  protected readonly checkedItems = signal<ReadonlySet<string>>(new Set());
  protected readonly localGuideView = signal<'map' | 'list'>('map');
  protected readonly localGuideQuery = signal('');
  protected readonly localGuideCategory = signal<'all' | NearbyServiceCategory>('all');
  protected readonly localGuideCategories: readonly ('all' | NearbyServiceCategory)[] = [
    'all',
    'restaurant',
    'cafe',
    'supermarket',
    'activity',
    'transport',
  ];
  protected readonly checkInAccess = computed(() => {
    const detail = this.facade.detail('home-access');
    return detail?.kind === 'home-access' ? detail : null;
  });
  protected readonly checkInCheckout = computed(() => {
    const detail = this.facade.detail('checkout');
    return detail?.kind === 'checkout' ? detail : null;
  });
  protected readonly checkInExtras = computed(() => {
    const detail = this.facade.detail('extras');
    return detail?.kind === 'extras' ? detail : null;
  });
  protected readonly checkInSpecialRequests = computed(() => {
    return this.checkInExtras()?.specialRequests ?? '';
  });
  protected readonly specialRequestOpen = signal(false);
  protected readonly specialRequestMessage = signal('');
  protected readonly specialRequestSender = signal('');
  protected readonly lateCheckoutOpen = signal(false);
  protected readonly specialRequestHostEmail = computed(() => {
    const detail = this.facade.detail('help');
    return detail?.kind === 'help' ? (detail.host?.email?.trim() ?? '') : '';
  });
  protected readonly canSendSpecialRequest = computed(() => {
    return Boolean(
      this.specialRequestHostEmail() &&
      this.specialRequestMessage().trim() &&
      this.specialRequestSender().trim(),
    );
  });
  protected readonly addressMap = computed<AddressMap | null>(() => {
    const detail = this.detail();
    if (detail?.kind !== 'home-address') {
      return null;
    }

    const mapReference = detail.mapReference ? this.mapParser.parse(detail.mapReference) : null;
    if (mapReference?.ok && mapReference.embedUrl) {
      return {
        externalUrl: mapReference.externalUrl,
        embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(mapReference.embedUrl),
      };
    }

    const address = detail.writtenAddress.trim();
    if (!address) {
      return null;
    }

    const externalUrl = new URL('https://www.google.com/maps/search/');
    externalUrl.searchParams.set('api', '1');
    externalUrl.searchParams.set('query', address);
    const embedUrl = new URL('https://www.google.com/maps');
    embedUrl.searchParams.set('q', address);
    embedUrl.searchParams.set('output', 'embed');

    return {
      externalUrl: externalUrl.toString(),
      embedUrl: this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl.toString()),
    };
  });

  protected readonly detail = computed<GuestGuideDetailDto | null>(() => {
    if (this.kind === 'local-guide') {
      const localGuide = this.facade.detail('local-guide');
      return (
        localGuide ??
        (this.facade.detail('transport')?.kind === 'transport'
          ? { kind: 'local-guide', services: [] }
          : null)
      );
    }

    return this.facade.detail(this.kind);
  });

  protected readonly homeCareDetail = computed(() => {
    const detail = this.facade.detail('home-care');
    return detail?.kind === 'home-care' ? detail : null;
  });

  protected readonly allLocalGuideServices = computed<readonly GuestNearbyServiceDto[]>(() => {
    const localGuide = this.facade.detail('local-guide');
    const transport = this.facade.detail('transport');
    const recommendations = localGuide?.kind === 'local-guide' ? localGuide.services : [];
    const connections = transport?.kind === 'transport' ? transport.services : [];
    return [...recommendations, ...connections];
  });

  protected readonly filteredLocalGuideServices = computed(() => {
    const query = this.localGuideQuery().trim().toLocaleLowerCase(this.i18n.locale());
    const category = this.localGuideCategory();

    return this.allLocalGuideServices().filter((service) => {
      const matchesCategory = category === 'all' || service.category === category;
      const haystack =
        `${service.title} ${service.whyUseful} ${service.distanceFromProperty}`.toLocaleLowerCase(
          this.i18n.locale(),
        );
      return matchesCategory && (query.length === 0 || haystack.includes(query));
    });
  });

  protected readonly fireEmergencyNumber = computed(() => {
    const summary = this.facade.summary?.();
    const location = `${summary?.propertyName ?? ''} ${summary?.cityOrArea ?? ''}`;
    return /sevilla/i.test(location) ? '080' : '112';
  });

  constructor() {
    const checkout = this.detail();
    if (checkout?.kind === 'checkout') {
      this.checkedItems.set(
        this.checklistStore.read(
          this.propertyId,
          checkout.checklist.map((item) => item.id),
        ),
      );
    }
  }

  protected toggleAccess(): void {
    this.accessRevealed.update((value) => !value);
  }

  protected toggleSpecialRequest(): void {
    this.specialRequestOpen.update((value) => !value);
  }

  protected toggleLateCheckout(): void {
    this.lateCheckoutOpen.update((value) => !value);
  }

  protected updateSpecialRequestMessage(event: Event): void {
    this.specialRequestMessage.set((event.target as HTMLTextAreaElement).value);
  }

  protected updateSpecialRequestSender(event: Event): void {
    this.specialRequestSender.set((event.target as HTMLInputElement).value);
  }

  protected sendSpecialRequest(event: SubmitEvent): void {
    event.preventDefault();
    if (!this.canSendSpecialRequest()) {
      return;
    }

    const subject = this.i18n.translate('guest.specialRequest.emailSubject');
    const body = `${this.i18n.translate('guest.specialRequest.message')}: ${this.specialRequestMessage().trim()}\n\n${this.i18n.translate('guest.specialRequest.sender')}: ${this.specialRequestSender().trim()}`;
    window.location.assign(
      `mailto:${encodeURIComponent(this.specialRequestHostEmail())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`,
    );
  }

  protected toggleLocationPreview(): void {
    this.locationPreviewOpen.update((value) => !value);
  }

  protected async copyAddress(address: string): Promise<void> {
    const value = address.trim();
    if (!value) {
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      } else {
        const fallback = document.createElement('textarea');
        fallback.value = value;
        fallback.style.position = 'fixed';
        fallback.style.opacity = '0';
        document.body.append(fallback);
        fallback.select();
        const copied = document.execCommand('copy');
        fallback.remove();
        if (!copied) {
          return;
        }
      }

      this.addressCopied.set(true);
      setTimeout(() => this.addressCopied.set(false), 2_000);
    } catch {
      this.addressCopied.set(false);
    }
  }

  protected setLocalGuideView(view: 'map' | 'list'): void {
    this.localGuideView.set(view);
  }

  protected updateLocalGuideQuery(event: Event): void {
    this.localGuideQuery.set((event.target as HTMLInputElement).value);
  }

  protected setLocalGuideCategory(category: 'all' | NearbyServiceCategory): void {
    this.localGuideCategory.set(category);
  }

  protected toggleChecklistItem(itemId: string): void {
    const next = new Set(this.checkedItems());
    if (next.has(itemId)) {
      next.delete(itemId);
    } else {
      next.add(itemId);
    }
    this.checkedItems.set(next);
    this.checklistStore.write(this.propertyId, next);
  }

  protected isChecked(itemId: string): boolean {
    return this.checkedItems().has(itemId);
  }

  protected policyLabel(policy: RulePolicy): string {
    const key: GuestCopyKey =
      policy === 'allowed' ? 'allowed' : policy === 'ask-host' ? 'askHost' : 'notAllowed';
    return this.copy.text(key);
  }

  protected accessMethodLabel(method: AccessMethod): string {
    return this.copy.text(
      method === 'meet-host'
        ? 'accessMethod.meetHost'
        : method === 'lockbox'
          ? 'accessMethod.lockbox'
          : method === 'door'
            ? 'accessMethod.door'
            : 'accessMethod.other',
    );
  }

  protected checkoutSummary(): string {
    const checkout = this.checkInCheckout();
    return checkout?.departureNote || checkout?.keyReturn || checkout?.rubbish || '';
  }

  protected displayDirections(directions: string): string {
    return directions === SEVILLA_FIXTURE_DIRECTIONS
      ? this.i18n.translate('guest.fixture.sevillaDirections')
      : directions;
  }

  protected categoryLabel(service: GuestNearbyServiceDto): string {
    return this.copy.text(`category.${service.category}`);
  }

  protected categoryFilterLabel(category: 'all' | NearbyServiceCategory): string {
    return category === 'all'
      ? this.i18n.translate('guest.allCategories')
      : this.copy.text(`category.${category}`);
  }

  protected serviceIcon(service: GuestNearbyServiceDto): IconName {
    switch (service.category) {
      case 'cafe':
        return 'coffee';
      case 'restaurant':
        return 'restaurant';
      case 'supermarket':
        return 'supermarket';
      case 'transport':
        return service.transportType === 'taxi' ? 'car' : 'bus';
      case 'activity':
        return 'star';
    }
  }

  protected markerClass(index: number): string {
    return `guest-guide-marker--${(index % 6) + 1}`;
  }

  protected customRuleIcon(ruleId: string): IconName {
    if (ruleId.includes('kitchen')) {
      return 'restaurant';
    }
    if (ruleId.includes('security')) {
      return 'shield';
    }
    if (ruleId.includes('keys')) {
      return 'key';
    }
    if (ruleId.includes('noise')) {
      return 'volume';
    }
    return 'info';
  }

  protected nearbySearchUrl(kind: 'hospital' | 'police station' | 'pharmacy'): string {
    const area = this.facade.summary?.()?.cityOrArea || 'Sevilla';
    const query = encodeURIComponent(`${kind} near ${area}`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  }

  protected transportLabel(type: 'public-transport' | 'taxi'): string {
    return this.copy.text(type === 'taxi' ? 'transport.taxi' : 'transport.public');
  }

  protected breakfastLabel(kind: 'on-request' | 'scheduled' | 'unavailable'): string {
    const key: GuestCopyKey =
      kind === 'on-request'
        ? 'breakfast.onRequest'
        : kind === 'scheduled'
          ? 'breakfast.scheduled'
          : 'breakfast.unavailable';
    return this.copy.text(key);
  }

  protected formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(this.i18n.locale(), { dateStyle: 'medium' }).format(date);
  }

  protected sectionTitleKey(): TranslationKey {
    switch (this.kind) {
      case 'check-in':
      case 'home-access':
      case 'home-address':
      case 'luggage':
      case 'parking':
        return 'guest.beforeArrival';
      case 'internet':
      case 'home-care':
      case 'house-rules':
      case 'extras':
      case 'checkout':
        return 'guest.duringStay';
      case 'local-guide':
      case 'transport':
        return 'guest.explore';
      case 'help':
        return 'guest.essentials';
    }
  }
}
