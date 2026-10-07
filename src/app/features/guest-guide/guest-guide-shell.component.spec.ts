import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { I18nService } from '../../core/i18n/i18n.service';
import { GuestGuideShellComponent } from './guest-guide-shell.component';
import { GuestGuideFacade } from './guest-guide.facade';

describe('GuestGuideShellComponent', () => {
  it('opens the recommendations map from the Environment menu item', async () => {
    await TestBed.configureTestingModule({
      imports: [GuestGuideShellComponent],
      providers: [
        provideRouter([]),
        { provide: GuestGuideFacade, useValue: { load: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'property-one',
              },
            },
          },
        },
        {
          provide: TranslateService,
          useValue: {
            addLangs: vi.fn(),
            setTranslation: vi.fn(),
            setFallbackLang: vi.fn(),
            use: vi.fn(),
            instant: (key: string) => key,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(GuestGuideShellComponent);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement)
        .querySelector<HTMLAnchorElement>('.guest-header__nav-item--environment')
        ?.getAttribute('href'),
    ).toBe('/guide/property-one/local-guide');
  });

  it('reflects the active locale in the guest language select', async () => {
    const facade = { load: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [GuestGuideShellComponent],
      providers: [
        provideRouter([]),
        { provide: GuestGuideFacade, useValue: facade },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'property-one',
              },
            },
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
                'common.continue': 'Continue',
                'language.change': 'Change language',
                'guest.backToGuide': 'Back to guide',
              })[key] ?? key,
          },
        },
      ],
    }).compileComponents();

    const i18n = TestBed.inject(I18nService);
    i18n.setLocale('fr-FR');
    const fixture = TestBed.createComponent(GuestGuideShellComponent);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector('select');

    expect(select).not.toBeNull();
    expect((select as HTMLSelectElement).value).toBe('fr-FR');
    expect(fixture.nativeElement.classList).toContain('guest-guide-shell--paper');
    expect(fixture.nativeElement.classList).not.toContain('guest-guide-shell--corkboard');
  });

  it('uses the corkboard background for the complete fixture guide', async () => {
    await TestBed.configureTestingModule({
      imports: [GuestGuideShellComponent],
      providers: [
        provideRouter([]),
        { provide: GuestGuideFacade, useValue: { load: vi.fn() } },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => 'fixture-property-complete',
              },
            },
          },
        },
        {
          provide: TranslateService,
          useValue: {
            addLangs: vi.fn(),
            setTranslation: vi.fn(),
            setFallbackLang: vi.fn(),
            use: vi.fn(),
            instant: (key: string) => key,
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(GuestGuideShellComponent);
    fixture.detectChanges();

    expect(fixture.nativeElement.classList).toContain('guest-guide-shell--corkboard');
  });
});
