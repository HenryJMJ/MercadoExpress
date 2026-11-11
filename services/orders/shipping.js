const shippingZones = {
  'Córdoba': {
    price: 10000,
    cities: {
      'Montería': 5000 // Special local price
    }
  },
  'Bolívar': { price: 15000 },
  'Atlántico': { price: 15000 },
  'Magdalena': { price: 15000 },
  'Sucre': { price: 15000 },
  'Cesar': { price: 15000 },
  'La Guajira': { price: 15000 },
  'Antioquia': { price: 18000 },
  'Caldas': { price: 18000 },
  'Risaralda': { price: 18000 },
  'Quindío': { price: 18000 },
  'Bogotá D.C.': { price: 20000 },
  'Cundinamarca': { price: 20000 },
  'Boyacá': { price: 20000 },
  'Santander': { price: 20000 },
  'Norte de Santander': { price: 20000 },
  'Valle del Cauca': { price: 25000 },
  'Cauca': { price: 25000 },
  'Nariño': { price: 25000 },
  'Tolima': { price: 25000 },
  'Huila': { price: 25000 },
  'Meta': { price: 25000 },
  'Amazonas': { price: 35000 },
  'Vichada': { price: 35000 },
  'Guainía': { price: 35000 },
  'Vaupés': { price: 35000 },
  'Guaviare': { price: 35000 },
  'Putumayo': { price: 35000 },
  'Caquetá': { price: 35000 },
  'Casanare': { price: 35000 },
  'Arauca': { price: 35000 },
  'Chocó': { price: 35000 },
  'San Andrés y Providencia': { price: 35000 }
};

function calculateShipping(department, city) {
  let cost = 25000; // Default fallback
  let zone = 'Nacional';

  if (shippingZones[department]) {
    cost = shippingZones[department].price;
    zone = department;
    
    // Check for city specific overrides
    if (shippingZones[department].cities && shippingZones[department].cities[city]) {
      cost = shippingZones[department].cities[city];
      zone = `${city}, ${department}`;
    }
  }

  return { cost, zone };
}

module.exports = { calculateShipping, shippingZones };
