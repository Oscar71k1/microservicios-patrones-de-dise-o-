/**
 * Script para verificar el estado de los microservicios
 */

const axios = require('axios');

const services = [
  { name: 'Gateway', url: 'http://localhost:3000/health' },
  { name: 'Usuarios', url: 'http://localhost:3001/health' },
  { name: 'Pagos', url: 'http://localhost:3002/health' },
  { name: 'Catálogo', url: 'http://localhost:3004/health' }
];

async function checkServices() {
  console.log('🔍 Verificando estado de microservicios...\n');
  
  for (const service of services) {
    try {
      const response = await axios.get(service.url, { timeout: 5000 });
      console.log(`✅ ${service.name}: ${response.status} - ${response.data.mensaje || 'OK'}`);
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log(`❌ ${service.name}: No está ejecutándose (ECONNREFUSED)`);
      } else if (error.response) {
        console.log(`⚠️ ${service.name}: ${error.response.status} - ${error.response.data?.error || 'Error'}`);
      } else {
        console.log(`❌ ${service.name}: ${error.message}`);
      }
    }
  }
  
  console.log('\n📋 Instrucciones:');
  console.log('1. Gateway: cd gateway && npm start');
  console.log('2. Usuarios: cd microservicios/usuarios && npm start');
  console.log('3. Pagos: cd microservicios/pagos && npm start');
  console.log('4. Catálogo: cd microservicios/catalogo && npm start');
}

checkServices().catch(console.error);
