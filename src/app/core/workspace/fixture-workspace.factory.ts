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
      distanceFromProperty: '5-minutos a pie',
      whyUseful: 'Ambiente relajante, menú diverso y buena relación calidad-precio.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-restaurant-azahar',
      title: 'Casa Azahar',
      category: 'restaurante',
      distanceFromProperty: '7-minutos a pie',
      whyUseful: 'Cocina andaluza de temporada, raciones para compartir y trato cercano.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-supermarket-patio',
      title: 'Mercado del Patio',
      category: 'supermercado',
      distanceFromProperty: '4-minutos a pie',
      whyUseful: 'Productos frescos y básicos para el día a día, a pocos minutos a pie.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-activity-mirador',
      title: 'Mirador del Barrio',
      category: 'actividades',
      distanceFromProperty: '12-minutos a pie',
      whyUseful: 'Un paseo tranquilo con buenas vistas y ambiente de barrio.',
      lastReviewedAt: reviewedAt,
    },
    {
      id: 'fixture-transport-city',
      title: 'Seabreeze public transport',
      category: 'transport',
      transportType: 'public-transport',
      distanceFromProperty: '8-minutos a pie',
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
      welcomeMessage: 'Bienvenido a este acogedor y elegante propiedad.',
    },
    arrivalAccess: {
      ...property.arrivalAccess,
      checkInTime: createTime24('15:00'),
      checkInInstructions: 'Porfavor, entra en la propiedad y sigue las señales azules para llegar a la entrada principal.',
      location: {
        writtenAddress: 'Calle la sevillana 3 , casco historico (fictional)',
        mapReference: '',
        directions: 'Sigue las señales azules después de entrar en Calle La Sevillana.',
      },
      homeAccess: {
        method: 'meet-host',
        instructions: 'El propietario se reunirá contigo en la entrada principal para entregarte las llaves.',
        doorCode: '',
        lockboxCode: '',
      },
      parking: {
        kind: 'nearby-free',
        address: 'Parking Square, casco histórico',
        instructions: 'Se puede aparcar en la plaza de aparcamiento gratuita más cercana, a 5 minutos a pie.',
      },
      luggage: {
        kind: 'internal',
        instructions: 'Se puede dejar el equipaje en la propiedad antes del check-in.',
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
      additionalNote: 'Porfavor, respeta a los vecinos y evita ruidos fuertes durante las horas de descanso.',
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
        instructions: 'Elige entre un desayuno continental o un desayuno andaluz. Avísanos con antelación para preparar tu elección.',
      },
      lateCheckout: {
        available: true,
        instructions:
          'La salida tardía tiene un coste de 20 € y puede solicitarse hasta las 14:00. Avísanos con antelación: está sujeta a disponibilidad y a la confirmación previa del propietario.',
      },
      specialRequests: 'Contacta con antelación para cualquier solicitud especial, como cuna o silla alta. Haremos todo lo posible por satisfacer tus necesidades.',
    },
    checkout: {
      ...property.checkout,
      checkoutTime: createTime24('11:00'),
      keyReturn: 'Deja las llaves en la caja de seguridad junto a la puerta principal antes de salir.',
      rubbish: 'Coloca los residuos en el área de reciclaje etiquetada.',
      departureNote: 'Revisa cada artículo para tu propia organización antes de salir.',
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
      welcomeMessage: 'A partially prepared guest guide.',
    },
    arrivalAccess: {
      ...property.arrivalAccess,
      checkInTime: createTime24('16:00'),
      checkInInstructions: 'Contactar con el anfitrión para organizar la llegada.',
      location: {
        ...property.arrivalAccess.location,
        directions: 'Las instrucciones de llegada aún deben añadirse.',
      },
      homeAccess: {
        ...property.arrivalAccess.homeAccess,
        method: 'meet-host',
        instructions: 'Reuirse con el anfitrión en la entrada principal para recoger las llaves.',
      },
    },
    homeEssentials: {
      wifi: null,
      homeCare: {
        ...property.homeEssentials.homeCare,
        waste: 'Usa los contenedores de reciclaje compartidos en el vestíbulo.',
      },
    },
    localGuide: [
      {
        id: 'fixture-supermarket-market',
        title: 'Salamanca Market',
        category: 'supermercado',
        distanceFromProperty: '10-minutos a pie',
        whyUseful: 'Compra práctica para productos cotidianos y frescos de la zona.',
        lastReviewedAt: now.toISOString(),
      },
    ],
    checkout: {
      ...property.checkout,
      checkoutTime: null,
      departureNote: 'El checkout es a las 11:00, pero las instrucciones de salida aún deben añadirse.',
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
