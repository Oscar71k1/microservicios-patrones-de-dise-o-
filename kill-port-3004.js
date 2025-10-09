const { exec } = require('child_process');

console.log('🔪 Matando procesos en puerto 3004...');

exec('netstat -ano | findstr :3004', (error, stdout) => {
  if (stdout) {
    const lines = stdout.trim().split('\n');
    const pids = lines
      .map(line => line.trim().split(/\s+/))
      .filter(parts => parts.length >= 5)
      .map(parts => parts[4])
      .filter(pid => pid && pid !== '0');
    
    if (pids.length > 0) {
      console.log(`🔪 Procesos encontrados en puerto 3004:`, pids);
      pids.forEach(pid => {
        console.log(`🔪 Matando proceso ${pid}...`);
        exec(`taskkill /PID ${pid} /F`, (error, stdout, stderr) => {
          if (error) {
            console.error(`❌ Error matando proceso ${pid}:`, error.message);
          } else {
            console.log(`✅ Proceso ${pid} terminado`);
          }
        });
      });
    } else {
      console.log('✅ No hay procesos en puerto 3004');
    }
  } else {
    console.log('✅ No hay procesos en puerto 3004');
  }
  
  // Esperar un poco y luego iniciar
  setTimeout(() => {
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
  }, 3000);
});






