import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import type { GuestGuideDetailDto, GuestGuideDetailKind } from '../../domain/guest-guide';
import { createTime24 } from '../../domain/property';
import { GuestChecklistStore } from './guest-checklist.store';
import { GuestGuideDetailPage } from './guest-guide-detail.page';
import { GuestGuideFacade } from './guest-guide.facade';

function configureDetail(
  kind: GuestGuideDetailKind,
  details: Readonly<Partial<Record<GuestGuideDetailKind, GuestGuideDetailDto | null>>>,
  checklistStore = {
    read: vi.fn().mockReturnValue(new Set<string>()),
    write: vi.fn(),
  },
) {
  return TestBed.configureTestingModule({
    imports: [GuestGuideDetailPage],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            data: { kind },
            parent: { paramMap: { get: () => 'property-one' } },
          },
        },
      },
      {
        provide: GuestGuideFacade,
        useValue: {
          detail: (requestedKind: GuestGuideDetailKind) => details[requestedKind] ?? null,
          summary: () => ({ propertyName: 'Sevilla Cosy place', cityOrArea: 'Sevilla' }),
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
              'guest.unavailable.title': 'This information is not available yet',
              'guest.unavailable.body': 'Check back later for updates',
              'guest.checklistHint': 'nothing is sent to your host',
              'guest.checkIn': 'Check-in',
              'guest.homeAddress': 'Home address',
              'guest.beforeArrival': 'Before you arrive',
              'guest.duringStay': 'During your stay',
              'guest.checkout': 'Check-out',
              'guest.accessMethod': 'Access method',
              'guest.doorCode': 'Door code',
              'guest.lockboxCode': 'Lockbox code',
              'guest.homeAccess': 'Home access',
              'guest.reveal': 'Reveal',
              'guest.hide': 'Hide',
              'guest.openMaps': 'Open map',
              'guest.mapPreview': 'Map preview',
              'guest.personalChecklist': 'Personal checklist',
              'guest.checkInTime': 'Check-in time',
              'guest.instructions': 'Instructions',
              'guest.address': 'Address',
              'guest.directions': 'Directions',
            })[key] ?? key,
        },
      },
      { provide: GuestChecklistStore, useValue: checklistStore },
    ],
  }).compileComponents();
}

describe('GuestGuideDetailPage', () => {
  it('keeps access codes out of the DOM until Reveal is activated on home access', async () => {
    await configureDetail('home-access', {
      'home-access': {
        kind: 'home-access',
        method: 'lockbox',
        instructions: 'Use the lockbox.',
        doorCode: 'door-2468',
        lockboxCode: 'box-1357',
      },
    });
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).not.toContain('door-2468');
    expect(element.textContent).not.toContain('box-1357');
    element.querySelector<HTMLButtonElement>('.guest-secret button')?.click();
    fixture.detectChanges();

    expect(element.textContent).toContain('door-2468');
    expect(element.textContent).toContain('box-1357');
  });

  it('keeps check-in content isolated from home access details', async () => {
    await configureDetail('check-in', {
      'check-in': {
        kind: 'check-in',
        checkInTime: createTime24('15:00'),
        instructions: 'Arrive after 15:00.',
      },
      'home-access': {
        kind: 'home-access',
        method: 'lockbox',
        instructions: 'Use the lockbox by the gate.',
        doorCode: 'door-2468',
      },
    });
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('Arrive after 15:00.');
    expect(element.textContent).not.toContain('Use the lockbox by the gate.');
    expect(element.textContent).not.toContain('Home access');
    expect(element.querySelector('.guest-secret button')).toBeNull();
  });

  it('shows the wifi password immediately without a reveal toggle', async () => {
    await configureDetail('internet', {
      internet: {
        kind: 'internet',
        networkName: 'Guest Wi-Fi',
        password: 'sunset-123',
        instructions: 'Use the guest network during your stay.',
      },
    });
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('sunset-123');
    expect(element.querySelector('.guest-secret button')).toBeNull();
    expect(element.querySelector('.guest-wifi-card')).not.toBeNull();
    expect(element.textContent).toContain('Need help with internet?');
  });

  it('shows the unavailable state for an absent detail DTO', async () => {
    await configureDetail('parking', {});
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'This information is not available yet',
    );
  });

  it('shows an inline Google Maps iframe and keeps the external location link as a separate CTA', async () => {
    await configureDetail('home-address', {
      'home-address': {
        kind: 'home-address',
        writtenAddress: 'Calle Mayor 12, Valencia',
        mapReference: 'https://www.google.com/maps/place/Valencia/@39.4699,-0.3763,12z',
      },
    });
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector<HTMLElement>('.guest-location-card');

    expect(card).not.toBeNull();
    expect(element.querySelector('iframe.guest-map')).not.toBeNull();
    expect(card?.querySelector('button')).toBeNull();
    expect(
      element.querySelector(
        'a[href="https://www.google.com/maps/place/Valencia/@39.4699,-0.3763,12z"]',
      ),
    ).not.toBeNull();
  });

  it('stores the personal checklist without any submit action', async () => {
    const checklistStore = {
      read: vi.fn().mockReturnValue(new Set<string>()),
      write: vi.fn(),
    };
    await configureDetail(
      'checkout',
      {
        checkout: {
          kind: 'checkout',
          checkoutTime: createTime24('11:00'),
          checklist: [{ id: 'keys', label: 'Return the keys' }],
        },
      },
      checklistStore,
    );
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.textContent).toContain('nothing is sent to your host');
    expect(element.querySelector('form')).toBeNull();
    element.querySelector<HTMLInputElement>('input[type="checkbox"]')?.click();
    fixture.detectChanges();

    expect(checklistStore.write).toHaveBeenCalledWith('property-one', new Set(['keys']));
  });

  it('combines house rules and home-care instructions in the visual rules grid', async () => {
    await configureDetail('house-rules', {
      'house-rules': {
        kind: 'house-rules',
        smoking: 'not-allowed',
        events: 'not-allowed',
        pets: 'ask-host',
        babies: 'allowed',
        children: 'allowed',
        visitors: 'ask-host',
      },
      'home-care': {
        kind: 'home-care',
        heatingAndCooling: 'Use the living-room controls.',
        waste: 'Use the recycling area.',
      },
    });
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.guest-rule-list')).not.toBeNull();
    expect(element.textContent).toContain('Use the living-room controls.');
    expect(element.textContent).toContain('Use the recycling area.');
  });

  it('switches the local guide between map and list views', async () => {
    await configureDetail('local-guide', {
      'local-guide': {
        kind: 'local-guide',
        services: [
          {
            id: 'cafe-one',
            title: 'Corner café',
            category: 'cafe',
            distanceFromProperty: '5 min',
            whyUseful: 'Breakfast nearby',
          },
        ],
      },
    });
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('.guest-guide-map')).not.toBeNull();
    const listButton = [...element.querySelectorAll<HTMLButtonElement>('button')].find((button) =>
      button.textContent?.includes('guest.listView'),
    );
    listButton?.click();
    fixture.detectChanges();

    expect(element.querySelector('.guest-service-list--recommendations')).not.toBeNull();
    expect(element.textContent).toContain('Corner café');
  });

  it('shows verified emergency call actions for the Sevilla fixture', async () => {
    await configureDetail('help', {
      help: { kind: 'help', emergencyNumber: '112' },
    });
    const fixture = TestBed.createComponent(GuestGuideDetailPage);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    expect(element.querySelector('a[href="tel:112"]')).not.toBeNull();
    expect(element.querySelector('a[href="tel:091"]')).not.toBeNull();
    expect(element.querySelector('a[href="tel:080"]')).not.toBeNull();
  });
});
