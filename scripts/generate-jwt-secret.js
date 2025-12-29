#!/usr/bin/env node

// Script para generar un JWT secret seguro
const crypto = require('crypto');

const jwtSecret = crypto.randomBytes(32).toString('hex');

console.log('\n🔐 JWT Secret generado:');
console.log('========================');
console.log(jwtSecret);
console.log('========================\n');
console.log('Copia este valor y agrégalo como JWT_SECRET en las variables de entorno de Vercel\n');
