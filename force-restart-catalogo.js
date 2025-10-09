const { exec } = require('child_process');

console.log('🔪 Forzando reinicio del microservicio de catálogo...');

// Función para matar todos los procesos de Node.js
function killAllNodeProcesses() {
  return new Promise((resolve) => {
    exec('tasklist /FI "IMAGENAME eq node.exe"', (error, stdout) => {
      if (stdout && stdout.includes('node.exe')) {
        console.log('🔪 Matando todos los procesos de Node.js...');
        exec('taskkill /IM node.exe /F', (error, stdout, stderr) => {
          if (error) {
            console.log('⚠️ Algunos procesos no se pudieron terminar:', error.message);
          } else {
            console.log('✅ Procesos de Node.js terminados');
          }
          setTimeout(resolve, 3000);
        });
      } else {
        console.log('✅ No hay procesos de Node.js corriendo');
        setTimeout(resolve, 1000);
      }
    });
  });
}

async function forceRestart() {
  try {
    // Matar todos los procesos de Node.js
    await killAllNodeProcesses();
    
    // Esperar un poco
    console.log('⏳ Esperando 5 segundos...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Iniciar el catálogo
    console.log('🚀 Iniciando microservicio de catálogo...');
    exec('cd microservicios/catalogo && npm start', (error, stdout, stderr) => {
      if (error) {
        console.error('❌ Error iniciando catálogo:', error.message);
      }
      if (stdout) {
        console.log('✅ Catálogo iniciado:', stdout);
      }
      if (stderr) {
        console.error('⚠️ Warnings:', stderr);
      }
    });
    
  } catch (error) {
    console.error('❌ Error en reinicio forzado:', error);
  }
}

forceRestart();






