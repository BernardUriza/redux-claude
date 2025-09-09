// 🧙‍♂️ GANDALF'S NUCLEAR BYPASS - Ejecutar Next sin cognitive-core build
// Creado por Bernard Orozco + Gandalf el Blanco

const { spawn } = require('child_process')

console.log('🧙‍♂️ GANDALF BYPASS: Iniciando Next.js sin cognitive-core build...')

// Ejecutar Next.js directamente
const nextProcess = spawn('npx', ['next', 'dev'], {
  stdio: 'inherit',
  shell: true
})

nextProcess.on('close', (code) => {
  console.log(`🧙‍♂️ Next.js process exited with code ${code}`)
})

nextProcess.on('error', (err) => {
  console.error('🔥 Error starting Next.js:', err)
})