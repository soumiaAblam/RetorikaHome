import type { OwnerProfile } from '../../domain/account';
import { createTime24, type NearbyService, type Property } from '../../domain/property';
import type { AccountWorkspace } from './account-workspace.model';
import { ACCOUNT_WORKSPACE_SCHEMA_VERSION } from './account-workspace.model';
import { createDefaultProperty } from './default-property.factory';

export const FIXTURE_ACCOUNT_ID = 'retorikahome-fixture-account';
export const FIXTURE_PROPERTY_IDS = [
  'fixture-property-complete',
  'fixture-property-incomplete',
  'fixture-property-nearly-empty',
] as const;

export const FIXTURE_PROFILE: OwnerProfile = {
  accountId: FIXTURE_ACCOUNT_ID,
  displayName: 'Retorica Home',
  contactEmail: 'hostairbnb@retorikahome.example',
  contactPhone: '+34 111111111',
  photoDataUrl: null,
};

function createCompleteProperty(now: Date): Property {
  const property = createDefaultProperty({
    id: FIXTURE_PROPERTY_IDS[0],
    ownerAccountId: FIXTURE_ACCOUNT_ID,
    now,
  });
  const reviewedAt = now.toISOString();
  const localGuide: readonly NearbyService[] = [
    {
      id: 'fixture-cafe-sunrise',
      title: 'Sunrise Corner Café',
      category: 'cafe',
      distanceFromProperty: '5-minute walk',
      whyUseful: 'Ambiente relajante, menú diverso y buena relación calidad-precio.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-restaurant-azahar',
      title: 'Casa Azahar',
      category: 'restaurant',
      distanceFromProperty: '7-minute walk',
      whyUseful: 'Cocina andaluza de temporada, raciones para compartir y trato cercano.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-supermarket-patio',
      title: 'Mercado del Patio',
      category: 'supermarket',
      distanceFromProperty: '4-minute walk',
      whyUseful: 'Productos frescos y básicos para el día a día, a pocos minutos a pie.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-activity-mirador',
      title: 'Mirador del Barrio',
      category: 'activity',
      distanceFromProperty: '12-minute walk',
      whyUseful: 'Un paseo tranquilo con buenas vistas y ambiente de barrio.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-transport-city',
      title: 'Seabreeze public transport',
      category: 'transport',
      transportType: 'public-transport',
      distanceFromProperty: '8-minute walk',
      whyUseful: 'Conexión cómoda para llegar al centro y a los principales puntos de interés.',
      lastReviewedAt: reviewedAt,
    },
  ];

  return {
    ...property,
    overview: {
      ...property.overview,
      name: 'Sevilla Cosy place',
      cityOrArea: 'Casco histórico',
      coverImage: {
        dataUrl: '/assets/house2.jpg',
        mimeType: 'image/jpeg',
        altText: 'Sevilla Cosy place',
      },
      propertyType: 'apartment',
      welcomeMessage: 'Welcome to this cosy and elegant property.',
    },
    arrivalAccess: {
      ...property.arrivalAccess,
      checkInTime: createTime24('15:00'),
      checkInInstructions: 'Please arrive through the main  entrance.',
      location: {
        writtenAddress: 'Calle la sevillana 3 , casco historico (fictional)',
        mapReference: '',
        directions: 'Follow the blue demo signs after entering Calle sevillana',
      },
      homeAccess: {
        method: 'meet-host',
        instructions: 'The host will meet you by the entrance door.',
        doorCode: '',
        lockboxCode: '',
      },
      parking: {
        kind: 'nearby-free',
        address: 'Demo Parking Square, casco histórico (fictional)',
        instructions: 'Use any space marked for demo visitors.',
      },
      luggage: {
        kind: 'internal',
        instructions: 'Ask the demo host to store luggage in the reception room.',
      },
    },
    homeEssentials: {
      wifi: {
        networkName: 'CasaOlmo Guest',
        password: '',
        instructions: '',
      },
      homeCare: {
        heatingAndCooling: 'Use the wall controls in the living room.',
        hotWater: 'Hot water is available throughout the stay.',
        powerIssues: 'Contact Stay support if a breaker needs attention.',
        waste: 'Use the labelled recycling area beside the courtyard.',
      },
    },
    houseRules: {
      ...property.houseRules,
      quietHours: {
        startTime: createTime24('22:00'),
        endTime: createTime24('08:00'),
      },
      additionalNote: 'Please treat the fictional neighbours with consideration.',
      customRules: [
        {
          id: 'fixture-rule-kitchen',
          title: 'Cocina',
          description: 'Deja todo limpio',
        },
        {
          id: 'fixture-rule-security',
          title: 'Seguridad',
          description: 'Cierra puertas y ventanas',
        },
        {
          id: 'fixture-rule-keys',
          title: 'Llaves',
          description: 'No hacer copias',
        },
        {
          id: 'fixture-rule-noise',
          title: 'Ruido',
          description: 'Evita ruidos fuertes',
        },
      ],
    },
    localGuide,
    extras: {
      ...property.extras,
      breakfast: {
        kind: 'scheduled',
        startTime: createTime24('08:00'),
        endTime: createTime24('10:00'),
        instructions: 'A fictional continental breakfast is shown for demo purposes.',
      },
      lateCheckout: {
        available: true,
        instructions: 'Ask the demo host at least one day before departure.',
      },
      specialRequests: 'Contact the demo host to discuss a special request.',
    },
    checkout: {
      ...property.checkout,
      checkoutTime: createTime24('11:00'),
      keyReturn: 'Hand the demo key to the host at the entrance door.',
      rubbish: 'Place rubbish in the labelled recycling area.',
      departureNote: 'Check each item for your own organisation before leaving.',
    },
    hostSupport: {
      name: FIXTURE_PROFILE.displayName,
      phone: FIXTURE_PROFILE.contactPhone,
      email: FIXTURE_PROFILE.contactEmail,
      photoDataUrl: FIXTURE_PROFILE.photoDataUrl,
    },
  };
}

function createIncompleteProperty(now: Date): Property {
  const property = createDefaultProperty({
    id: FIXTURE_PROPERTY_IDS[1],
    ownerAccountId: FIXTURE_ACCOUNT_ID,
    now,
  });

  return {
    ...property,
    overview: {
      ...property.overview,
      name: 'Carmen Studio ',
      cityOrArea: 'Barrio Salamanca, Madrid',
      propertyType: 'room',
      welcomeMessage: 'A partially prepared fictional guest guide.',
    },
    arrivalAccess: {
      ...property.arrivalAccess,
      checkInTime: createTime24('16:00'),
      checkInInstructions: 'Contact the demo host when you reach the district.',
      location: {
        ...property.arrivalAccess.location,
        directions: 'The final address still needs to be added.',
      },
      homeAccess: {
        ...property.arrivalAccess.homeAccess,
        method: 'meet-host',
        instructions: 'Meet the demo host outside the building.',
      },
    },
    homeEssentials: {
      wifi: null,
      homeCare: {
        ...property.homeEssentials.homeCare,
        waste: 'Use the shared recycling containers in the entrance hall.',
      },
    },
    localGuide: [
      {
        id: 'fixture-supermarket-market',
        title: 'Salamanca Market',
        category: 'supermarket',
        distanceFromProperty: '10-minute walk',
        whyUseful: 'Compra práctica para productos cotidianos y frescos de la zona.',
        lastReviewedAt: now.toISOString(),
      },
    ],
    checkout: {
      ...property.checkout,
      checkoutTime: null,
      departureNote: 'The departure time still needs to be added.',
    },
    hostSupport: {
      name: FIXTURE_PROFILE.displayName,
      phone: FIXTURE_PROFILE.contactPhone,
      email: FIXTURE_PROFILE.contactEmail,
      photoDataUrl: FIXTURE_PROFILE.photoDataUrl,
    },
  };
}

function createNearlyEmptyProperty(now: Date): Property {
  const property = createDefaultProperty({
    id: FIXTURE_PROPERTY_IDS[2],
    ownerAccountId: FIXTURE_ACCOUNT_ID,
    now,
  });

  return {
    ...property,
    overview: {
      ...property.overview,
      name: 'Cactus Almeria House',
      cityOrArea: 'Carretera andalucia 345, Almeria',
      coverImage: {
        dataUrl: '/assets/house.jpg',
        mimeType: 'image/jpeg',
        altText: 'Cactus House View',
      },
    },
    arrivalAccess: {
      ...property.arrivalAccess,
      location: {
        writtenAddress: 'Carretera andalucia 345, Almeria',
        mapReference: 'https://maps.app.goo.gl/zje4hatvhzWc91rAA',
        directions: 'Use the desert trail after the first bend in the road.',
      },
    },
    internalNotes: 'Nearly empty fixture used to demonstrate the attention state.',
  };
}

export function createFixtureWorkspace(now = new Date()): AccountWorkspace {
  return {
    schemaVersion: ACCOUNT_WORKSPACE_SCHEMA_VERSION,
    profile: { ...FIXTURE_PROFILE },
    properties: [
      createCompleteProperty(now),
      createIncompleteProperty(now),
      createNearlyEmptyProperty(now),
    ],
  };
}
