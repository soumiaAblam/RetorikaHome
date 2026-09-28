import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { I18nService } from '../../core/i18n/i18n.service';
import { localeOptions, type SupportedLocale } from '../../core/i18n/locale';
import { UiIconComponent } from '../../shared/ui';
import { GuestGuideFacade } from './guest-guide.facade';
import {
  GUEST_GUIDE_NAV_ITEMS,
  sectionForDetail,
  sectionForFragment,
  type GuestGuideSectionId,
} from './guest-guide-navigation';
import type { GuestGuideDetailKind } from '../../domain/guest-guide';

@Component({
  selector: 'app-guest-guide-shell',
  imports: [RouterLink, RouterOutlet, UiIconComponent],
  templateUrl: './guest-guide-shell.component.html',
  styleUrl: './guest-guide.scss',
  host: {
    class: 'guest-guide-shell--paper',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class GuestGuideShellComponent {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly facade = inject(GuestGuideFacade);
  protected readonly i18n = inject(I18nService);
  protected readonly localeOptions = localeOptions;
  protected readonly navItems = GUEST_GUIDE_NAV_ITEMS;
  protected readonly propertyId: string;
  protected readonly isHome = signal(true);
  protected readonly activeSection = signal<GuestGuideSectionId>('before');

  constructor() {
    const activatedRoute = inject(ActivatedRoute);
    this.propertyId = activatedRoute.snapshot.paramMap.get('propertyId') ?? '';
    this.facade.load(this.propertyId);
    this.updatePageKind();

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.updatePageKind());
  }

  protected changeLocale(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (localeOptions.some((option) => option.locale === value)) {
      this.i18n.setLocale(value as SupportedLocale);
    }
  }

  private updatePageKind(): void {
    const urlTree = this.router.parseUrl(this.router.url);
    const path = urlTree.root.children['primary']?.segments.map((segment) => segment.path) ?? [];
    const guideIndex = path.indexOf('guide');
    const detailKind = path[guideIndex + 2] as GuestGuideDetailKind | undefined;
    const home = detailKind === undefined;

    this.isHome.set(home);
    this.activeSection.set(
      home ? sectionForFragment(urlTree.fragment) : sectionForDetail(detailKind),
    );
  }
}
