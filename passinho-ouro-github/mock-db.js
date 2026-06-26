/* =====================================================
   PASSINHO DE OURO — mock-db.js
   Simulação de Backend usando localStorage para GitHub Pages
   ===================================================== */

'use strict';

const MOCK_DB = {
  users: [
    { _id: 'u1', nome: 'Administrador', email: 'admin@passinho.com', usuario: 'admin', senha: '123', tipo: 'admin' },
    { _id: 'u2', nome: 'Professor João', email: 'joao@passinho.com', usuario: 'professor', senha: '123', tipo: 'professor' },
    { _id: 'u3', nome: 'Maria Silva (Mãe)', email: 'maria@email.com', usuario: 'aluno', senha: '123', tipo: 'aluno', aluno_id: 'a1' }
  ],
  alunos: [
    { _id: 'a1', nome: 'Pedro Silva', ra: '2024001', serie: '5º Ano', turma: 'A', responsavel_id: 'u3' },
    { _id: 'a2', nome: 'Ana Costa', ra: '2024002', serie: '4º Ano', turma: 'B', responsavel_id: 'u3' }
  ],
  financeiro: [
    { _id: 'f1', aluno_id: 'a1', valor: 450.00, vencimento: '2024-07-10', status: 'pendente' },
    { _id: 'f2', aluno_id: 'a1', valor: 450.00, vencimento: '2024-06-10', status: 'pago' }
  ],
  comunicados: [
    { _id: 'c1', titulo: 'Festa Junina', mensagem: 'Nossa festa será no dia 15/07!', data: new Date().toISOString() },
    { _id: 'c2', titulo: 'Reunião de Pais', mensagem: 'Reunião bimestral na próxima quarta.', data: new Date().toISOString() }
  ],
  notas: [
    { _id: 'n1', aluno_id: 'a1', materia: 'Matemática', bimestre: '1º', nota: 8.5 },
    { _id: 'n2', aluno_id: 'a1', materia: 'Português', bimestre: '1º', nota: 9.0 }
  ],
  frequencia: [
    { _id: 'fr1', aluno_id: 'a1', data: '2024-06-20', status: 'presente' },
    { _id: 'fr2', aluno_id: 'a1', data: '2024-06-21', status: 'ausente' }
  ]
};

// Inicializar banco de dados no localStorage se não existir
function initMockDB() {
  if (!localStorage.getItem('passinho_db_users')) {
    localStorage.setItem('passinho_db_users', JSON.stringify(MOCK_DB.users));
    localStorage.setItem('passinho_db_alunos', JSON.stringify(MOCK_DB.alunos));
    localStorage.setItem('passinho_db_financeiro', JSON.stringify(MOCK_DB.financeiro));
    localStorage.setItem('passinho_db_comunicados', JSON.stringify(MOCK_DB.comunicados));
    localStorage.setItem('passinho_db_notas', JSON.stringify(MOCK_DB.notas));
    localStorage.setItem('passinho_db_frequencia', JSON.stringify(MOCK_DB.frequencia));
  }
}

initMockDB();

// Helper para operações de CRUD
const db = {
  get: (key) => JSON.parse(localStorage.getItem(`passinho_db_${key}`) || '[]'),
  save: (key, data) => localStorage.setItem(`passinho_db_${key}`, JSON.stringify(data)),
  
  // Auth
  login: (usuario, senha) => {
    const users = db.get('users');
    const user = users.find(u => u.usuario === usuario && u.senha === senha);
    if (user) {
      const { senha, ...userWithoutPassword } = user;
      return { ok: true, ...userWithoutPassword, token: 'mock-jwt-token' };
    }
    return { ok: false, message: 'Usuário ou senha incorretos.' };
  },

  // Generic CRUD
  list: (key) => db.get(key),
  create: (key, item) => {
    const data = db.get(key);
    const newItem = { ...item, _id: Date.now().toString() };
    data.push(newItem);
    db.save(key, data);
    return newItem;
  },
  delete: (key, id) => {
    const data = db.get(key);
    const filtered = data.filter(i => i._id !== id);
    db.save(key, filtered);
    return { ok: true };
  }
};

// Mock do fetch global para interceptar chamadas /api
const originalFetch = window.fetch;
window.fetch = async (url, options) => {
  if (typeof url === 'string' && url.includes('/api')) {
    console.log('Intercepted API call:', url, options);
    
    // Simular delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Login
    if (url.endsWith('/auth/login')) {
      const { usuario, senha } = JSON.parse(options.body);
      const result = db.login(usuario, senha);
      return {
        ok: result.ok,
        json: async () => result
      };
    }

    // Users (Register)
    if (url.endsWith('/auth/register')) {
      const body = JSON.parse(options.body);
      const newUser = db.create('users', body);
      return { ok: true, json: async () => newUser };
    }

    // Users (List/Delete)
    if (url.includes('/auth/users')) {
      if (options.method === 'DELETE') {
        const id = url.split('/').pop();
        return { ok: true, json: async () => db.delete('users', id) };
      }
      return { ok: true, json: async () => db.list('users') };
    }

    // Alunos
    if (url.includes('/alunos')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        const newAluno = db.create('alunos', { ...body, ra: Math.floor(1000000 + Math.random() * 9000000).toString() });
        return { ok: true, json: async () => newAluno };
      }
      if (options.method === 'DELETE') {
        const id = url.split('/').pop();
        return { ok: true, json: async () => db.delete('alunos', id) };
      }
      return { ok: true, json: async () => db.list('alunos') };
    }

    // Financeiro
    if (url.includes('/financeiro')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return { ok: true, json: async () => db.create('financeiro', body) };
      }
      return { ok: true, json: async () => db.list('financeiro') };
    }

    // Comunicados
    if (url.includes('/comunicados')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return { ok: true, json: async () => db.create('comunicados', body) };
      }
      if (options.method === 'DELETE') {
        const id = url.split('/').pop();
        return { ok: true, json: async () => db.delete('comunicados', id) };
      }
      return { ok: true, json: async () => db.list('comunicados') };
    }

    // Notas e Frequência (usados pelo professor)
    if (url.includes('/notas')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return { ok: true, json: async () => db.create('notas', body) };
      }
      return { ok: true, json: async () => db.list('notas') };
    }

    if (url.includes('/frequencia')) {
      if (options.method === 'POST') {
        const body = JSON.parse(options.body);
        return { ok: true, json: async () => db.create('frequencia', body) };
      }
      return { ok: true, json: async () => db.list('frequencia') };
    }

    return { ok: false, status: 404, json: async () => ({ message: 'Not Found (Mock)' }) };
  }
  
  return originalFetch(url, options);
};
