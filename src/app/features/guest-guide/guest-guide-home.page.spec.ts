import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import type { GuestGuideSummaryDto } from '../../domain/guest-guide';
import { GuestGuideFacade } from './guest-guide.facade';
import { GuestGuideHomePage } from './guest-guide-home.page';

const summary: GuestGuideSummaryDto = {
  propertyId: 'property-one',
  propertyName: 'Casa Olmo',
  propertyType: 'apartment',
  cityOrArea: 'Valencia',
  lastReviewedAt: '2026-08-13T12:00:00.000Z',
  availableDetails: ['check-in', 'home-address', 'local-guide'],
};

describe('GuestGuideHomePage', () => {
  const summarySignal = signal<GuestGuideSummaryDto | null>(summary);

  beforeEach(async () => {
    summarySignal.set(summary);
    await TestBed.configureTestingModule({
      imports: [GuestGuideHomePage],
      providers: [
        provideRouter([
          { path: 'home-address', component: GuestGuideHomePage },
          { path: 'local-guide', component: GuestGuideHomePage },
        ]),
        {
          provide: GuestGuideFacade,
          useValue: {
            summary: summarySignal.asReadonly(),
            detail: (kind: string) =>
              kind === 'help'
                ? {
                    kind: 'help',
                    emergencyNumber: '112',
                    host: { name: 'Alex Morgan', phone: '+34 000 000 000' },
                  }
                : null,
          },
        },
        {
          provide: TranslateService,
          useValue: {
            addLangs: vi.fn(),
            setTranslation: vi.fn(),
            setFallbackLang: vi.fn(),
            use: vi.fn(),
            instant: (key: string) =>
              ({
                'guest.beforeArrival': 'Before you arrive',
                'guest.duringStay': 'During your stay',
                'guest.essentials': 'Essentials',
                'guest.nav.profile': 'Profile',
                'guest.homeAddress': 'Home address',
                'guest.card.addressTitle': 'Address',
                'guest.card.arrivalTitle': 'Schedule and access',
                'guest.recommendationsMap': 'Recommendations map',
                'guest.awards': 'Awards',
                'guest.unavailable.title': 'This information is not available yet',
                'guest.unavailable.body': 'Your host has not added details for this section.',
                'guest.welcome': 'Welcome to Casa Olmo',
                'guest.lastReviewed': 'Last reviewed: 13 August 2026',
                'guest.startHere': 'Start here',
              })[key] ?? key,
          },
        },
      ],
    }).compileComponents();
  });

  it('shows only the requested cards in each guide section', () => {
    const fixture = TestBed.createComponent(GuestGuideHomePage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const headings = [...element.querySelectorAll('.section-title-note > h2')].map((heading) =>
      heading.textContent?.trim(),
    );

    expect(headings).toEqual(['Before you arrive', 'During your stay', 'Essentials', 'Profile']);
    expect(
      [...element.querySelectorAll<HTMLAnchorElement>('.guide-card-grid .guide-action-card')].map(
        (card) => card.getAttribute('href'),
      ),
    ).toEqual([
      '/check-in',
      '/home-address',
      '/luggage',
      '/internet',
      '/house-rules',
      '/local-guide',
      '/help',
      '/extras',
    ]);
    expect(element.querySelector('a[href="/local-guide"]')?.textContent).toContain(
      'Recommendations map',
    );
    expect(element.querySelector('a[href="/extras"]')?.textContent).toContain('Awards');
  });

  it('navigates when a whole card is activated', async () => {
    const fixture = TestBed.createComponent(GuestGuideHomePage);
    const router = TestBed.inject(Router);
    fixture.detectChanges();

    (fixture.nativeElement as HTMLElement)
      .querySelector<HTMLAnchorElement>('a[href="/home-address"]')
      ?.click();
    await fixture.whenStable();

    expect(router.url).toBe('/home-address');
  });

  it('renders a safe unavailable state when no mapped guide exists', () => {
    summarySignal.set(null);
    const fixture = TestBed.createComponent(GuestGuideHomePage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'This information is not available yet',
    );
  });
});
