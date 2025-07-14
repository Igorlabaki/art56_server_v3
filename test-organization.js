const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testOrganization() {
  try {
    // Verificar se a organização existe
    const organizationId = "bcd0138b-d44f-4237-a436-0ee748a224b1";
    const userId = "754c5bb2-af51-455a-b49d-efc2bd7421ef";
    
    console.log('Verificando organização...');
    const organization = await prisma.organization.findUnique({
      where: { id: organizationId }
    });
    
    if (organization) {
      console.log('✅ Organização encontrada:', organization.name);
    } else {
      console.log('❌ Organização não encontrada');
    }
    
    console.log('\nVerificando usuário...');
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (user) {
      console.log('✅ Usuário encontrado:', user.username);
    } else {
      console.log('❌ Usuário não encontrado');
    }
    
    console.log('\nVerificando UserOrganization...');
    const userOrganization = await prisma.userOrganization.findFirst({
      where: {
        userId: userId,
        organizationId: organizationId
      }
    });
    
    if (userOrganization) {
      console.log('✅ UserOrganization encontrado:', userOrganization.id);
    } else {
      console.log('❌ UserOrganization não encontrado');
    }
    
    console.log('\nListando todas as organizações...');
    const allOrganizations = await prisma.organization.findMany({
      select: { id: true, name: true }
    });
    
    console.log('Organizações disponíveis:');
    allOrganizations.forEach(org => {
      console.log(`- ${org.id}: ${org.name}`);
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testOrganization(); 