// Dados de exemplo para a biblioteca.
// Cada documento tem um campo `type` para diferenciar (já que usamos a collection _default).

export const books = [
  {
    key: 'book::001',
    doc: {
      type: 'book',
      isbn: '978-85-359-0277-5',
      title: 'Cem Anos de Solidão',
      authors: ['Gabriel García Márquez'],
      genre: 'ficcao',
      tags: ['realismo-magico', 'classico', 'latam'],
      publishedYear: 1967,
      copies: 3,
      reviews: [
        { user: 'user::001', rating: 5, comment: 'Obra-prima absoluta.' },
        { user: 'user::002', rating: 4, comment: 'Denso mas vale.' },
      ],
    },
  },
  {
    key: 'book::002',
    doc: {
      type: 'book',
      isbn: '978-85-7232-742-5',
      title: 'O Cortiço',
      authors: ['Aluísio Azevedo'],
      genre: 'ficcao',
      tags: ['naturalismo', 'brasil', 'classico'],
      publishedYear: 1890,
      copies: 2,
      reviews: [
        { user: 'user::003', rating: 4, comment: 'Retrato cru e necessário.' },
      ],
    },
  },
  {
    key: 'book::003',
    doc: {
      type: 'book',
      isbn: '978-85-359-0556-1',
      title: 'Sapiens',
      authors: ['Yuval Noah Harari'],
      genre: 'historia',
      tags: ['divulgacao', 'antropologia'],
      publishedYear: 2011,
      copies: 5,
      reviews: [
        { user: 'user::001', rating: 5, comment: 'Mudou minha visão.' },
        { user: 'user::002', rating: 3, comment: 'Generaliza demais.' },
        { user: 'user::004', rating: 4, comment: 'Leitura obrigatória.' },
      ],
    },
  },
  {
    key: 'book::004',
    doc: {
      type: 'book',
      isbn: '978-85-325-2304-1',
      title: 'Clean Code',
      authors: ['Robert C. Martin'],
      genre: 'tecnologia',
      tags: ['engenharia-software', 'boas-praticas'],
      publishedYear: 2008,
      copies: 4,
      reviews: [
        { user: 'user::004', rating: 5, comment: 'Referência da carreira.' },
      ],
    },
  },
  {
    key: 'book::005',
    doc: {
      type: 'book',
      isbn: '978-85-7522-403-1',
      title: 'Estruturas de Dados e Algoritmos em Java',
      authors: ['Michael T. Goodrich', 'Roberto Tamassia'],
      genre: 'tecnologia',
      tags: ['algoritmos', 'java', 'academico'],
      publishedYear: 2013,
      copies: 2,
      reviews: [],
    },
  },
  {
    key: 'book::006',
    doc: {
      type: 'book',
      isbn: '978-85-7522-911-1',
      title: 'Dom Casmurro',
      authors: ['Machado de Assis'],
      genre: 'ficcao',
      tags: ['realismo', 'brasil', 'classico'],
      publishedYear: 1899,
      copies: 6,
      reviews: [
        { user: 'user::001', rating: 5, comment: 'Capitu traiu? Eis a questão.' },
        { user: 'user::003', rating: 5, comment: 'Genial.' },
        { user: 'user::004', rating: 4, comment: 'Ótimo, narrativa ambígua.' },
      ],
    },
  },
];

export const users = [
  {
    key: 'user::001',
    doc: {
      type: 'user',
      name: 'Ana Beatriz Souza',
      email: 'ana.souza@example.com',
      role: 'leitor',
      address: { city: 'Juiz de Fora', state: 'MG', zip: '36010-000' },
      memberSince: '2023-03-15',
    },
  },
  {
    key: 'user::002',
    doc: {
      type: 'user',
      name: 'Bruno Oliveira',
      email: 'bruno.o@example.com',
      role: 'leitor',
      address: { city: 'Rio de Janeiro', state: 'RJ', zip: '20040-002' },
      memberSince: '2024-01-08',
    },
  },
  {
    key: 'user::003',
    doc: {
      type: 'user',
      name: 'Carla Mendes',
      email: 'carla.m@example.com',
      role: 'bibliotecario',
      address: { city: 'Juiz de Fora', state: 'MG', zip: '36015-100' },
      memberSince: '2022-09-22',
    },
  },
  {
    key: 'user::004',
    doc: {
      type: 'user',
      name: 'Daniel Pereira',
      email: 'daniel.p@example.com',
      role: 'leitor',
      address: { city: 'Belo Horizonte', state: 'MG', zip: '30130-110' },
      memberSince: '2025-02-01',
    },
  },
];

export const loans = [
  {
    key: 'loan::001',
    doc: {
      type: 'loan',
      userId: 'user::001',
      bookId: 'book::001',
      borrowedAt: '2026-05-10',
      dueDate: '2026-05-24',
      returnedAt: '2026-05-22',
      status: 'devolvido',
    },
  },
  {
    key: 'loan::002',
    doc: {
      type: 'loan',
      userId: 'user::002',
      bookId: 'book::003',
      borrowedAt: '2026-05-15',
      dueDate: '2026-05-29',
      returnedAt: null,
      status: 'ativo',
    },
  },
  {
    key: 'loan::003',
    doc: {
      type: 'loan',
      userId: 'user::001',
      bookId: 'book::006',
      borrowedAt: '2026-05-20',
      dueDate: '2026-06-03',
      returnedAt: null,
      status: 'ativo',
    },
  },
  {
    key: 'loan::004',
    doc: {
      type: 'loan',
      userId: 'user::004',
      bookId: 'book::004',
      borrowedAt: '2026-04-22',
      dueDate: '2026-05-06',
      returnedAt: '2026-05-04',
      status: 'devolvido',
    },
  },
  {
    key: 'loan::005',
    doc: {
      type: 'loan',
      userId: 'user::003',
      bookId: 'book::006',
      borrowedAt: '2026-05-25',
      dueDate: '2026-06-08',
      returnedAt: null,
      status: 'ativo',
    },
  },
];
