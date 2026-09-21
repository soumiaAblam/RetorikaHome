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
  readonly hint?: TranslationKey;
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
      label: 'guest.checkIn',
      hint: 'guest.card.arrivalHint',
      path: 'check-in',
      icon: 'door',
      tone: 'blue',
      note: 'fuchsia',
    },
    {
      label: 'guest.homeAddress',
      hint: 'guest.card.addressHint',
      path: 'home-address',
      icon: 'map-pin',
      tone: 'purple',
      note: 'green',
    },
    {
      label: 'guest.luggage',
      hint: 'guest.card.luggageHint',
      path: 'luggage',
      icon: 'luggage',
      tone: 'yellow',
      note: 'blue',
    },
    {
      label: 'guest.parking',
      hint: 'guest.card.parkingHint',
      path: 'parking',
      icon: 'parking',
      tone: 'pink',
      note: 'apricot',
    },
  ];

  protected readonly essentialCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.homeAccess',
      hint: 'guest.card.accessHint',
      path: 'home-access',
      icon: 'key',
      tone: 'blue',
      note: 'offwhite',
    },
    {
      label: 'guest.internet',
      hint: 'guest.card.internetHint',
      path: 'internet',
      icon: 'wifi',
      tone: 'green',
      note: 'lightbrick',
    },
    {
      label: 'guest.getHelp',
      hint: 'guest.card.helpHint',
      path: 'help',
      icon: 'help-circle',
      tone: 'pink',
      note: 'lightbrown',
    },
  ];

  protected readonly duringStayCards: readonly GuestHomeCard[] = [
    {
      label: 'guest.homeCare',
      hint: 'guest.card.homeCareHint',
      path: 'home-care',
      icon: 'home-care',
      tone: 'yellow',
      note: 'offwhite',
    },
    {
      label: 'guest.houseRules',
      hint: 'guest.card.rulesHint',
      path: 'house-rules',
      icon: 'list',
      tone: 'green',
      note: 'apricot',
    },
    {
      label: 'guest.extras',
      hint: 'guest.card.extrasHint',
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
