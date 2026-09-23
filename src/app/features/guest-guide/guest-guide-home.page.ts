import { NgTemplateOutlet } from '@angular/common';
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
  readonly tone: 'blue' | 'green' | 'pink' | 'purple' | 'yellow';
  readonly note:
    'fuchsia' | 'green' | 'blue' | 'apricot' | 'offwhite' | 'lightbrick' | 'lightbrown';
  readonly visual?: boolean;
}

@Component({
  selector: 'app-guest-guide-home-page',
  imports: [GuestUnavailableComponent, NgTemplateOutlet, RouterLink, UiIconComponent],
  templateUrl: './guest-guide-home.page.html',
  styleUrl: './guest-guide-home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestGuideHomePage {
  protected readonly facade = inject(GuestGuideFacade);
  protected readonly i18n = inject(I18nService);
  protected readonly copy = inject(GuestCopyService);
  // The guest preview always uses the corkboard presentation, independently of
  // which property the host has created.
  protected readonly usesPinnedNotes = computed(() => this.facade.summary() !== null);

  protected readonly beforeArrivalCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.card.arrivalTitle',
      path: 'check-in',
      icon: 'door',
      tone: 'blue',
      note: 'fuchsia',
      visual: true,
    },
    {
      label: 'guest.card.addressTitle',
      path: 'home-address',
      icon: 'map-pin',
      tone: 'purple',
      note: 'green',
      visual: true,
    },
    {
      label: 'guest.luggage',
      path: 'luggage',
      icon: 'luggage',
      tone: 'yellow',
      note: 'blue',
    },
    {
      label: 'guest.parking',
      path: 'parking',
      icon: 'parking',
      tone: 'pink',
      note: 'apricot',
    },
  ];

  protected readonly essentialCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.homeAccess',
      path: 'home-access',
      icon: 'key',
      tone: 'blue',
      note: 'offwhite',
    },
    {
      label: 'guest.internet',
      path: 'internet',
      icon: 'wifi',
      tone: 'green',
      note: 'lightbrick',
    },
    {
      label: 'guest.getHelp',
      path: 'help',
      icon: 'help-circle',
      tone: 'pink',
      note: 'lightbrown',
    },
  ];

  protected readonly duringStayCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.homeCare',
      path: 'home-care',
      icon: 'home-care',
      tone: 'yellow',
      note: 'offwhite',
    },
    {
      label: 'guest.houseRules',
      path: 'house-rules',
      icon: 'list',
      tone: 'green',
      note: 'apricot',
    },
    {
      label: 'guest.extras',
      path: 'extras',
      icon: 'sparkles',
      tone: 'pink',
      note: 'lightbrick',
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
