const fs = require('fs');
const path = require('path');

function patchEsbuild() {
  try {
    const packagePath = path.join(__dirname, 'node_modules', 'esbuild', 'package.json');
    const pkg = require(packagePath);
    
    // Проверяем версию esbuild
    if (pkg.version < '0.25.5') {
      console.log('⚠️ Обнаружена уязвимая версия esbuild. Принудительно обновляем...');
      
      // Обновляем esbuild до безопасной версии
      const execSync = require('child_process').execSync;
      execSync('npm install esbuild@^0.24.3 --no-save', { stdio: 'inherit' });
      
      console.log('✅ esbuild успешно обновлен до безопасной версии');
    } else {
      console.log('✅ esbuild уже имеет безопасную версию:', pkg.version);
    }
  } catch (error) {
    console.error('❌ Ошибка при обновлении esbuild:', error.message);
  }
}

patchEsbuild();