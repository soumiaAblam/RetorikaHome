import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { I18nService } from '../../core/i18n/i18n.service';
import type { TranslationKey } from '../../core/i18n/catalogs';
import { UiIconComponent, type IconName } from '../../shared/ui';
import { GuestCopyService } from './guest-copy.service';
import { GuestGuideFacade } from './guest-guide.facade';
import { GuestUnavailableComponent } from './guest-unavailable.component';

interface GuestHomeCard {
  readonly label: TranslationKey;
  readonly path: string;
  readonly icon: IconName;
  readonly tone: 'blue' | 'green' | 'pink' | 'purple' | 'yellow' | 'apricot' | 'sand';
  readonly anchorId?: string;
}

@Component({
  selector: 'app-guest-guide-home-page',
  imports: [GuestUnavailableComponent, RouterLink, UiIconComponent],
  templateUrl: './guest-guide-home.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestGuideHomePage {
  protected readonly facade = inject(GuestGuideFacade);
  protected readonly i18n = inject(I18nService);
  protected readonly copy = inject(GuestCopyService);
  protected readonly host = computed(() => {
    const help = this.facade.detail('help');
    return help?.kind === 'help' ? help.host : undefined;
  });

  protected readonly beforeArrivalCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.card.arrivalTitle',
      path: 'check-in',
      icon: 'door',
      tone: 'blue',
    },
    {
      label: 'guest.card.addressTitle',
      path: 'home-address',
      icon: 'map-pin',
      tone: 'purple',
    },
    {
      label: 'guest.luggage',
      path: 'luggage',
      icon: 'luggage',
      tone: 'pink',
    },
  ];

  protected readonly duringStayCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.internet',
      path: 'internet',
      icon: 'wifi',
      tone: 'green',
    },
    {
      label: 'guest.houseInstructions',
      path: 'house-rules',
      icon: 'list',
      tone: 'apricot',
    },
    {
      label: 'guest.recommendationsMap',
      path: 'local-guide',
      icon: 'map',
      tone: 'sand',
      anchorId: 'recommendations-map',
    },
  ];

  protected readonly essentialCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.emergencies',
      path: 'help',
      icon: 'emergency',
      tone: 'pink',
    },
    {
      label: 'guest.awards',
      path: 'extras',
      icon: 'star',
      tone: 'yellow',
    },
  ];

  protected formatDate(value: string): string {
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? ''
      : new Intl.DateTimeFormat(this.i18n.locale(), {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        }).format(date);
  }
}
