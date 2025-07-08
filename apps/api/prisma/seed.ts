/* eslint-disable @typescript-eslint/no-misused-promises */
import {
  PrismaClient,
  UserRole,
  PaymentStatus,
  DocumentType,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

// Funções para gerar documentos válidos
function generateValidCPF(): string {
  // Gerar os 9 primeiros dígitos
  const digits = Array.from({ length: 9 }, () =>
    faker.number.int({ min: 0, max: 9 }),
  );

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += digits[i] * (10 - i);
  }
  const firstDigit = ((sum * 10) % 11) % 10;
  digits.push(firstDigit);

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += digits[i] * (11 - i);
  }
  const secondDigit = ((sum * 10) % 11) % 10;
  digits.push(secondDigit);

  return digits.join('');
}

function generateValidCNPJ(): string {
  // Gerar os 12 primeiros dígitos
  const digits = Array.from({ length: 12 }, () =>
    faker.number.int({ min: 0, max: 9 }),
  );

  // Calcular primeiro dígito verificador
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * weights1[i];
  }
  const firstDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  digits.push(firstDigit);

  // Calcular segundo dígito verificador
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += digits[i] * weights2[i];
  }
  const secondDigit = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  digits.push(secondDigit);

  return digits.join('');
}

function generateBrazilianPhone(): string {
  // Gerar telefone brasileiro no formato: +55 + DDD + número
  const ddd = faker.helpers.arrayElement([
    '11',
    '21',
    '31',
    '41',
    '51',
    '61',
    '71',
    '81',
    '85',
    '87',
  ]);
  const number = faker.number.int({ min: 900000000, max: 999999999 });
  return `+55${ddd}${number}`;
}

// Dados realistas para seed
const adminUsers = [
  { name: 'Carlos Silva', email: 'carlos@carlao.com', phone: '+5511999000001' },
  { name: 'Ana Santos', email: 'ana@carlao.com', phone: '+5511999000002' },
];

const agencyUsers = [
  {
    name: 'Agência Turismo SP',
    email: 'contato@turismosp.com',
    phone: '+5511987654321',
    photoUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400',
  },
  {
    name: 'Viagens & Cia',
    email: 'vendas@viagensecia.com',
    phone: '+5511987654322',
    photoUrl: 'https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400',
  },
  {
    name: 'Explore Brasil',
    email: 'info@explorebrasil.com',
    phone: '+5511987654323',
    photoUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
  },
  {
    name: 'Aventura Tours',
    email: 'contato@aventuratours.com',
    phone: '+5511987654324',
    photoUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400',
  },
  {
    name: 'Destinos Incríveis',
    email: 'reservas@destinosincriveis.com',
    phone: '+5511987654325',
    photoUrl: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
  },
  {
    name: 'Mundo Viagens',
    email: 'contato@mundoviagens.com',
    phone: '+5511987654326',
    photoUrl:
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400',
  },
  {
    name: 'Elite Travel',
    email: 'elite@elitetravel.com',
    phone: '+5511987654327',
    photoUrl:
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
  },
  {
    name: 'Sonho Dourado Turismo',
    email: 'sonho@sonhodourado.com',
    phone: '+5511987654328',
    photoUrl:
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400',
  },
];

const supplierUsers = [
  {
    name: 'João Silva Santos',
    email: 'joao@transporte.com',
    phone: '+5511876543210',
    approved: true,
    photoUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
  },
  {
    name: 'Maria Fernanda Costa',
    email: 'maria@viptransfer.com',
    phone: '+5511876543211',
    approved: true,
    photoUrl:
      'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
  },
  {
    name: 'Pedro Henrique Lima',
    email: 'pedro@executrans.com',
    phone: '+5511876543212',
    approved: true,
    photoUrl:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
  },
  {
    name: 'Carla Regina Oliveira',
    email: 'carla@premiumride.com',
    phone: '+5511876543213',
    approved: true,
    photoUrl:
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
  },
  {
    name: 'Roberto Carlos Souza',
    email: 'roberto@turismocar.com',
    phone: '+5511876543214',
    approved: true,
    photoUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
  },
  {
    name: 'Fernanda Alves',
    email: 'fernanda@expresscar.com',
    phone: '+5511876543215',
    approved: true,
    photoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
  },
  {
    name: 'Anderson Pereira',
    email: 'anderson@luxotransfer.com',
    phone: '+5511876543216',
    approved: false,
    photoUrl:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
  },
  {
    name: 'Juliana Martins',
    email: 'juliana@smartride.com',
    phone: '+5511876543217',
    approved: false,
    photoUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
  },
  {
    name: 'Ricardo Mendes',
    email: 'ricardo@goldentransfer.com',
    phone: '+5511876543218',
    approved: false,
    photoUrl:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
  },
  {
    name: 'Patrícia Rocha',
    email: 'patricia@elitetransport.com',
    phone: '+5511876543219',
    approved: true,
    photoUrl:
      'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400',
  },
];

const services = [
  {
    name: 'Transfer Aeroporto GRU',
    description:
      'Transporte executivo do/para Aeroporto de Guarulhos com veículo premium, motorista bilíngue e acompanhamento de voo.',
    isActive: true,
  },
  {
    name: 'Transfer Aeroporto Congonhas',
    description:
      'Serviço de transfer para Aeroporto de Congonhas com pontualidade garantida e veículo climatizado.',
    isActive: true,
  },
  {
    name: 'City Tour São Paulo',
    description:
      'Tour completo pela cidade de São Paulo incluindo principais pontos turísticos com guia especializado.',
    isActive: true,
  },
  {
    name: 'Transporte Executivo',
    description:
      'Transporte executivo para reuniões de negócios com veículo de luxo e motorista uniformizado.',
    isActive: true,
  },
  {
    name: 'Transfer Rodoviária Tietê',
    description:
      'Transporte confortável do/para Rodoviária do Tietê com assistência para bagagens.',
    isActive: true,
  },
  {
    name: 'Transporte para Eventos',
    description:
      'Serviço especializado para eventos corporativos e sociais com frota diversificada.',
    isActive: true,
  },
  {
    name: 'Tour Litoral Paulista',
    description:
      'Excursão para o litoral paulista com paradas em Santos, Guarujá e São Vicente.',
    isActive: true,
  },
  {
    name: 'Transfer Interestadual',
    description:
      'Viagens para outras cidades e estados com veículos confortáveis e motoristas experientes.',
    isActive: false, // Some services inactive for testing
  },
  {
    name: 'Transporte Hospitalar',
    description:
      'Transporte especializado para consultas médicas e procedimentos hospitalares.',
    isActive: true,
  },
  {
    name: 'Transporte Noturno',
    description:
      'Serviço 24h para transporte noturno com segurança e conforto garantidos.',
    isActive: true,
  },
  {
    name: 'Transfer Aeroporto Viracopos',
    description:
      'Transporte para Aeroporto de Viracopos (Campinas) com monitoramento de voo e assistência.',
    isActive: true,
  },
  {
    name: 'City Tour Rio de Janeiro',
    description:
      'Tour completo pelo Rio de Janeiro incluindo Cristo Redentor, Pão de Açúcar e praias.',
    isActive: true,
  },
  {
    name: 'Transporte Corporativo Mensal',
    description:
      'Pacote mensal de transporte executivo para empresas com desconto especial.',
    isActive: false, // Inactive for testing
  },
  {
    name: 'Transfer Shopping Centers',
    description:
      'Transporte para principais shopping centers da região com espera incluída.',
    isActive: true,
  },
  {
    name: 'Excursão Campos do Jordão',
    description:
      'Viagem para Campos do Jordão com paradas turísticas e guia especializado.',
    isActive: true,
  },
];

async function main() {
  console.log('🌱 Starting enhanced seed...');

  // Limpar dados existentes
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.serviceUser.deleteMany();
  await prisma.service.deleteMany();
  await prisma.user.deleteMany();
  await prisma.location.deleteMany();

  console.log('🗑️  Cleared existing data');

  // Criar localizações
  const locations = await Promise.all([
    prisma.location.create({
      data: { city: 'São Paulo', state: 'SP' },
    }),
    prisma.location.create({
      data: { city: 'Rio de Janeiro', state: 'RJ' },
    }),
    prisma.location.create({
      data: { city: 'Belo Horizonte', state: 'MG' },
    }),
    prisma.location.create({
      data: { city: 'Porto Alegre', state: 'RS' },
    }),
    prisma.location.create({
      data: { city: 'Salvador', state: 'BA' },
    }),
    prisma.location.create({
      data: { city: 'Brasília', state: 'DF' },
    }),
  ]);

  console.log(`📍 Created ${locations.length} locations`);

  // Criar usuários admin
  const adminPassword = await bcrypt.hash('admin123', 10);
  const createdAdmins: any[] = [];

  for (let i = 0; i < adminUsers.length; i++) {
    const adminData = adminUsers[i];
    const admin = await prisma.user.create({
      data: {
        email: adminData.email,
        name: adminData.name,
        role: UserRole.ADMIN,
        password: adminPassword,
        phone: adminData.phone,
        isApproved: true,
        document: generateValidCPF(),
        documentType: DocumentType.CPF,
        address: faker.location.streetAddress(),
        city: locations[i % locations.length].city,
        locationId: locations[i % locations.length].id,
      },
    });
    createdAdmins.push(admin);
  }

  console.log(`👑 Created ${createdAdmins.length} admin users`);

  // Criar usuários agência
  const agencyPassword = await bcrypt.hash('agency123', 10);
  const createdAgencies: any[] = [];

  for (let i = 0; i < agencyUsers.length; i++) {
    const agencyData = agencyUsers[i];
    const agency = await prisma.user.create({
      data: {
        email: agencyData.email,
        name: agencyData.name,
        role: UserRole.AGENCY,
        password: agencyPassword,
        phone: agencyData.phone,
        photoUrl: agencyData.photoUrl,
        isApproved: true,
        document: generateValidCNPJ(),
        documentType: DocumentType.CNPJ,
        address: faker.location.streetAddress(),
        city: locations[i % locations.length].city,
        locationId: locations[i % locations.length].id,
      },
    });
    createdAgencies.push(agency);
  }

  console.log(`🏢 Created ${createdAgencies.length} agency users`);

  // Criar usuários fornecedores
  const supplierPassword = await bcrypt.hash('supplier123', 10);
  const createdSuppliers: any[] = [];

  for (let i = 0; i < supplierUsers.length; i++) {
    const supplierData = supplierUsers[i];
    const supplier = await prisma.user.create({
      data: {
        email: supplierData.email,
        name: supplierData.name,
        role: UserRole.SUPPLIER,
        password: supplierPassword,
        phone: supplierData.phone,
        photoUrl: supplierData.photoUrl,
        isApproved: supplierData.approved,
        document: generateValidCNPJ(),
        documentType: DocumentType.CNPJ,
        address: faker.location.streetAddress(),
        city: locations[i % locations.length].city,
        locationId: locations[i % locations.length].id,
      },
    });
    createdSuppliers.push(supplier);
  }

  console.log(`🚛 Created ${createdSuppliers.length} supplier users`);

  // Criar usuários customers
  const customerPassword = await bcrypt.hash('customer123', 10);
  const createdCustomers: any[] = [];

  const customerUsers = [
    {
      name: 'Carlos Oliveira',
      email: 'carlos.customer@carlao.com',
      phone: '+5511444444444',
    },
    {
      name: 'Ana Costa',
      email: 'ana.customer@carlao.com',
      phone: '+5521333333333',
    },
    {
      name: 'Pedro Santos',
      email: 'pedro.customer@carlao.com',
      phone: '+5531222222222',
    },
    {
      name: 'Maria Silva',
      email: 'maria.customer@carlao.com',
      phone: '+5541111111111',
    },
  ];

  for (let i = 0; i < customerUsers.length; i++) {
    const customerData = customerUsers[i];
    const customer = await prisma.user.create({
      data: {
        email: customerData.email,
        name: customerData.name,
        role: UserRole.CUSTOMER,
        password: customerPassword,
        phone: customerData.phone,
        isApproved: true,
        document: generateValidCPF(),
        documentType: DocumentType.CPF,
        address: faker.location.streetAddress(),
        city: locations[i % locations.length].city,
        // Customers don't need locationId
      },
    });
    createdCustomers.push(customer);
  }

  console.log(`👤 Created ${createdCustomers.length} customer users`);

  // Criar usuários adicionais com Faker
  console.log('🎲 Creating additional users with Faker...');

  // Criar mais agências com dados aleatórios
  for (let i = 0; i < 5; i++) {
    const agency = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.company.name(),
        role: UserRole.AGENCY,
        password: agencyPassword,
        phone: generateBrazilianPhone(),
        photoUrl: faker.image.url({ width: 400, height: 400 }),
        isApproved: true,
        document: generateValidCNPJ(),
        documentType: DocumentType.CNPJ,
        address: faker.location.streetAddress(),
        city: locations[i % locations.length].city,
        locationId: locations[i % locations.length].id,
      },
    });
    createdAgencies.push(agency);
  }

  // Criar mais fornecedores com dados aleatórios
  for (let i = 0; i < 8; i++) {
    const supplier = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: UserRole.SUPPLIER,
        password: supplierPassword,
        phone: generateBrazilianPhone(),
        photoUrl: faker.image.avatar(),
        isApproved: faker.datatype.boolean(),
        document: generateValidCNPJ(),
        documentType: DocumentType.CNPJ,
        address: faker.location.streetAddress(),
        city: locations[i % locations.length].city,
        locationId: locations[i % locations.length].id,
      },
    });
    createdSuppliers.push(supplier);
  }

  // Criar mais clientes com dados aleatórios
  for (let i = 0; i < 10; i++) {
    const customer = await prisma.user.create({
      data: {
        email: faker.internet.email(),
        name: faker.person.fullName(),
        role: UserRole.CUSTOMER,
        password: customerPassword,
        phone: generateBrazilianPhone(),
        isApproved: true,
        document: generateValidCPF(),
        documentType: DocumentType.CPF,
        address: faker.location.streetAddress(),
        city: locations[i % locations.length].city,
        // Customers don't need locationId
      },
    });
    createdCustomers.push(customer);
  }

  console.log(
    `🎲 Created additional users: ${5} agencies, ${8} suppliers, ${10} customers`,
  );

  // Criar serviços
  const createdServices: any[] = [];
  for (let i = 0; i < services.length; i++) {
    const serviceData = services[i];
    const service = await prisma.service.create({
      data: {
        ...serviceData,
        locationId: locations[i % locations.length].id,
      },
    });
    createdServices.push(service);
  }

  console.log(`🛎️  Created ${createdServices.length} services`);

  // Criar produtos para os serviços
  console.log('📦 Creating products...');
  const productData = [
    // Transfer Aeroporto GRU
    {
      name: 'Transfer Básico GRU',
      description: 'Transfer básico para Aeroporto de Guarulhos',
      price: 8500,
      serviceIndex: 0,
    },
    {
      name: 'Transfer Premium GRU',
      description: 'Transfer premium com veículo de luxo para GRU',
      price: 15000,
      serviceIndex: 0,
    },
    {
      name: 'Transfer VIP GRU',
      description: 'Transfer VIP com motorista bilíngue e acompanhamento',
      price: 25000,
      serviceIndex: 0,
    },

    // Transfer Aeroporto Congonhas
    {
      name: 'Transfer Básico Congonhas',
      description: 'Transfer básico para Aeroporto de Congonhas',
      price: 6500,
      serviceIndex: 1,
    },
    {
      name: 'Transfer Executivo Congonhas',
      description: 'Transfer executivo para Congonhas',
      price: 12000,
      serviceIndex: 1,
    },

    // City Tour São Paulo
    {
      name: 'City Tour Meio Período',
      description: 'Tour de 4 horas pelos principais pontos turísticos',
      price: 18000,
      serviceIndex: 2,
    },
    {
      name: 'City Tour Dia Completo',
      description: 'Tour de 8 horas com almoço incluído',
      price: 35000,
      serviceIndex: 2,
    },
    {
      name: 'City Tour Noturno',
      description: 'Tour noturno pela vida noturna de São Paulo',
      price: 22000,
      serviceIndex: 2,
    },

    // Transporte Executivo
    {
      name: 'Transporte Executivo 2h',
      description: 'Transporte executivo por 2 horas',
      price: 16000,
      serviceIndex: 3,
    },
    {
      name: 'Transporte Executivo 4h',
      description: 'Transporte executivo por 4 horas',
      price: 28000,
      serviceIndex: 3,
    },
    {
      name: 'Transporte Executivo Dia',
      description: 'Transporte executivo dia completo',
      price: 50000,
      serviceIndex: 3,
    },

    // Transfer Rodoviária Tietê
    {
      name: 'Transfer Básico Tietê',
      description: 'Transfer básico para Rodoviária do Tietê',
      price: 4500,
      serviceIndex: 4,
    },
    {
      name: 'Transfer Conforto Tietê',
      description: 'Transfer confortável com assistência',
      price: 7500,
      serviceIndex: 4,
    },

    // Transporte para Eventos
    {
      name: 'Transporte Evento Pequeno',
      description: 'Transporte para eventos até 10 pessoas',
      price: 20000,
      serviceIndex: 5,
    },
    {
      name: 'Transporte Evento Médio',
      description: 'Transporte para eventos até 20 pessoas',
      price: 35000,
      serviceIndex: 5,
    },
    {
      name: 'Transporte Evento Grande',
      description: 'Transporte para eventos até 50 pessoas',
      price: 65000,
      serviceIndex: 5,
    },

    // Tour Litoral Paulista
    {
      name: 'Tour Litoral 1 Dia',
      description: 'Tour de 1 dia pelo litoral paulista',
      price: 38000,
      serviceIndex: 6,
    },
    {
      name: 'Tour Litoral Weekend',
      description: 'Tour de fim de semana com hospedagem',
      price: 85000,
      serviceIndex: 6,
    },

    // Transfer Interestadual
    {
      name: 'Transfer Rio de Janeiro',
      description: 'Transfer para Rio de Janeiro',
      price: 120000,
      serviceIndex: 7,
    },
    {
      name: 'Transfer Belo Horizonte',
      description: 'Transfer para Belo Horizonte',
      price: 95000,
      serviceIndex: 7,
    },

    // Transporte Hospitalar
    {
      name: 'Transporte Consulta',
      description: 'Transporte para consultas médicas',
      price: 5500,
      serviceIndex: 8,
    },
    {
      name: 'Transporte Emergência',
      description: 'Transporte de emergência 24h',
      price: 9500,
      serviceIndex: 8,
    },

    // Transporte Noturno
    {
      name: 'Transporte Noturno Básico',
      description: 'Transporte noturno básico',
      price: 8000,
      serviceIndex: 9,
    },
    {
      name: 'Transporte Noturno Premium',
      description: 'Transporte noturno premium com segurança',
      price: 15000,
      serviceIndex: 9,
    },
  ];

  const createdProducts: any[] = [];
  for (const product of productData) {
    const service = createdServices[product.serviceIndex];
    if (service) {
      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          description: product.description,
          price: product.price,
          currency: 'BRL',
          serviceId: service.id,
          isActive: true,
          // Add some Stripe IDs for testing (not real ones)
          stripeProductId:
            Math.random() > 0.7
              ? `prod_test_${faker.string.alphanumeric(10)}`
              : null,
          stripePriceId:
            Math.random() > 0.7
              ? `price_test_${faker.string.alphanumeric(10)}`
              : null,
        },
      });
      createdProducts.push(createdProduct);
    }
  }

  console.log(`📦 Created ${createdProducts.length} products`);

  // Criar associações entre serviços e usuários
  console.log('🔗 Creating service-user associations...');

  // Associar alguns serviços com usuários (ADMIN, AGENCY, SUPPLIER)
  const eligibleUsers = [
    ...createdAdmins,
    ...createdAgencies,
    ...createdSuppliers,
  ];

  for (let i = 0; i < createdServices.length; i++) {
    const service = createdServices[i];

    // Selecionar 1-3 usuários aleatórios para associar ao serviço
    const numUsers = Math.floor(Math.random() * 3) + 1;
    const selectedUsers: any[] = [];

    for (let j = 0; j < numUsers; j++) {
      let attempts = 0;
      let validUser = null;

      // Tentar encontrar um usuário válido (máximo 10 tentativas)
      while (attempts < 10 && !validUser) {
        const randomUser: any =
          eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];

        // Verificar se o usuário já foi selecionado
        if (selectedUsers.find((u) => u.id === randomUser.id)) {
          attempts++;
          continue;
        }

        // Todos os usuários devem ter a mesma localização do serviço
        if (randomUser.locationId === service.locationId) {
          validUser = randomUser;
        }

        attempts++;
      }

      if (validUser) {
        selectedUsers.push(validUser);
      }
    }

    // Criar as associações
    for (const user of selectedUsers) {
      await prisma.serviceUser.create({
        data: {
          serviceId: service.id,
          userId: user.id,
        },
      });
    }
  }

  console.log('🔗 Service-user associations created successfully!');

  // Criar pagamentos de exemplo
  const paymentDescriptions = [
    'Transfer Aeroporto GRU - Executivo VIP',
    'City Tour São Paulo - Grupo Empresarial',
    'Transporte Executivo - Reunião de Negócios',
    'Transfer Evento Corporativo - Convenção',
    'Serviço Hospitalar - Consulta Médica',
    'Tour Litoral Paulista - Fim de Semana',
    'Transporte Noturno - Evento Social',
    'Transfer Interestadual - Viagem de Negócios',
    'Evento Social - Casamento Premium',
    'Transfer Rodoviária Tietê - Família',
    'Transfer Aeroporto Congonhas - Executivo',
    'Transporte Corporativo - Reunião Mensal',
    'City Tour Rio de Janeiro - Turismo',
    'Transfer Shopping Centers - Compras',
    'Excursão Campos do Jordão - Turismo',
    'Transfer Aeroporto Viracopos - Viagem',
    'Transporte Hospitalar - Emergência',
    'Evento Corporativo - Lançamento Produto',
    'Transfer Hotel - Check-in VIP',
    'Transporte Executivo - Aeroporto Internacional',
  ];

  const paymentMethods = [
    'PIX',
    'Cartão de Crédito',
    'Cartão de Débito',
    'Transferência Bancária',
    'Dinheiro',
    'Boleto',
  ];
  const createdPayments: any[] = [];

  // Criar pagamentos com valores em centavos (baseados nos serviços)
  const paymentAmounts = [
    8500, // R$ 85,00
    6500, // R$ 65,00
    18000, // R$ 180,00
    12000, // R$ 120,00
    4500, // R$ 45,00
    20000, // R$ 200,00
    35000, // R$ 350,00
    28000, // R$ 280,00
    9000, // R$ 90,00
    11000, // R$ 110,00
    15000, // R$ 150,00
    22000, // R$ 220,00
    250000, // R$ 2500,00
    5500, // R$ 55,00
    38000, // R$ 380,00
    7500, // R$ 75,00
    9500, // R$ 95,00
    16500, // R$ 165,00
    13500, // R$ 135,00
    8500, // R$ 85,00
    19500, // R$ 195,00
    32000, // R$ 320,00
    25000, // R$ 250,00
    10500, // R$ 105,00
    12500, // R$ 125,00
  ];

  for (let i = 0; i < 25; i++) {
    const isProcessed = Math.random() > 0.25; // 75% chance de estar processado
    const hasUser = Math.random() > 0.3; // 70% chance de ter usuário associado
    const amount =
      paymentAmounts[Math.floor(Math.random() * paymentAmounts.length)];
    const description =
      paymentDescriptions[
        Math.floor(Math.random() * paymentDescriptions.length)
      ];

    // Criar datas mais distribuídas (últimos 60 dias)
    const daysAgo = Math.floor(Math.random() * 60);
    const createdDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    // Selecionar usuário aleatório (agências, fornecedores ou clientes)
    const allUsers = [
      ...createdAgencies,
      ...createdSuppliers,
      ...createdCustomers,
    ];
    const selectedUser =
      hasUser && allUsers.length > 0
        ? allUsers[Math.floor(Math.random() * allUsers.length)]
        : null;

    const payment = await prisma.payment.create({
      data: {
        amount,
        description,
        status: isProcessed ? PaymentStatus.PAID : PaymentStatus.PENDING,
        paymentMethod: isProcessed
          ? paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
          : null,
        paidAt: isProcessed
          ? new Date(
              createdDate.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000,
            ) // Pago até 7 dias depois
          : null,
        processedById: isProcessed
          ? createdAdmins[Math.floor(Math.random() * createdAdmins.length)].id
          : null,
        userId: selectedUser?.id || null,
        createdAt: createdDate,
      },
    });
    createdPayments.push(payment);
  }

  console.log(`💰 Created ${createdPayments.length} payments`);

  // Criar pedidos (orders) de exemplo
  console.log('🛒 Creating orders...');
  const createdOrders: any[] = [];

  // Criar 30 pedidos de exemplo
  for (let i = 0; i < 30; i++) {
    const customer =
      createdCustomers[Math.floor(Math.random() * createdCustomers.length)];
    const product =
      createdProducts[Math.floor(Math.random() * createdProducts.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 quantity
    const totalAmount = product.price * quantity;

    // 70% chance of being paid, 20% pending, 10% cancelled
    const statusRandom = Math.random();
    let status;
    if (statusRandom < 0.7) {
      status = 'PAID';
    } else if (statusRandom < 0.9) {
      status = 'PENDING';
    } else {
      status = 'CANCELLED';
    }

    // Create order date in the last 90 days
    const daysAgo = Math.floor(Math.random() * 90);
    const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

    const order = await prisma.order.create({
      data: {
        customerId: customer.id,
        productId: product.id,
        serviceId: product.serviceId,
        quantity,
        totalAmount,
        status,
        createdAt: orderDate,
      },
    });
    createdOrders.push(order);
  }

  console.log(`🛒 Created ${createdOrders.length} orders`);

  console.log('✅ Enhanced seed completed successfully!');
  console.log('📊 Summary:', {
    locations: locations.length,
    admins: createdAdmins.length,
    agencies: createdAgencies.length,
    suppliers: createdSuppliers.length,
    customers: createdCustomers.length,
    services: createdServices.length,
    products: createdProducts.length,
    payments: createdPayments.length,
    orders: createdOrders.length,
  });
  console.log('🔑 Login credentials:');
  console.log('  Admin: carlos@carlao.com / admin123');
  console.log('  Agency: contato@turismosp.com / agency123');
  console.log('  Supplier: joao@transporte.com / supplier123');
  console.log('  Customer: carlos.customer@carlao.com / customer123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
