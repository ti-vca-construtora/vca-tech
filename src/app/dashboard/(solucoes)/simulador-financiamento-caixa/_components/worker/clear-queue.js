const { Queue } = require('bullmq');

const queue = new Queue('simulador-caixa', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

async function clearQueue() {
  try {
    console.log('🗑️  Limpando fila...');
    
    // Limpar jobs em diferentes estados
    await queue.drain(); // Remove todos os jobs waiting
    await queue.clean(0, 1000, 'completed'); // Remove completed
    await queue.clean(0, 1000, 'failed'); // Remove failed
    await queue.clean(0, 1000, 'delayed'); // Remove delayed
    await queue.clean(0, 1000, 'active'); // Remove active
    
    console.log('✅ Fila limpa com sucesso!');
    
    const counts = await queue.getJobCounts();
    console.log('📊 Estado da fila:', counts);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao limpar fila:', error);
    process.exit(1);
  }
}

clearQueue();
