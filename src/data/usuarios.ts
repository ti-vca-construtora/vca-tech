export type Usuario = {
  user: string;
  email: string;
  setor: string;
  cargo: string;
  senha: string;
  token: string;
};

export const usuarios: Usuario[] = [
  {
    user: "userxrfa",
    senha: "KLOp0hjDWW",
    token:
      "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoidXNlcnhyZmEiLCJzZW5oYSI6IktMT3AwaGpEV1cifQ.jseUmUVdkVIrvZcwooktr7A9-O2DU82VixXA12Y68oE",
    email: "userxrfa@vcaconstrutora.com.br",
    setor: "Financeiro",
    cargo: "Master",
  },
  {
    user: "admin",
    senha: "ADMIN123",
    token:
      "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyIjoiYWRtaW4iLCJzZW5oYSI6IkFETUlOMTIzIn0.VUmuwycoYshwar4ilKQShhJeQKPHsD3Q5wuFt1nHt1o",
    email: "admin@vcaconstrutora.com.br",
    setor: "Admin",
    cargo: "Master",
  },
  {
    user: "relacionamento",
    senha: "Vca@2025",
    token:
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoicmVsYWNpb25hbWVudG8iLCJwYXNzd29yZCI6IlZjYUAyMDI1In0.RBdF9QWVsiBRYZJhX4AYFRsvV1xvzNKm6PC2gUXmgKw",
    email: "relacionamento@vcaconstrutora.com.br",
    setor: "Relacionamento",
    cargo: "Master",
  },
];
