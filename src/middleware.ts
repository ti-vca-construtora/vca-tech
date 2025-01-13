import { NextRequest, NextResponse } from 'next/server'

// Alterar função para validar o payload completo de usuário
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log('Middleware executado para:', pathname)

  // Ignorar rotas públicas
  if (pathname === '/login') {
    console.log('Rota /login detectada, ignorando middleware.')
    return NextResponse.next()
  }

  if (pathname.startsWith('/public')) {
    console.log('Rota pública detectada:', pathname)
    return NextResponse.next()
  }

  // Obter o token do cookie
  const token = req.cookies.get('vca-tech-authorize')?.value
  console.log('Token encontrado:', token)

  if (!token) {
    console.log('Token ausente ou inválido. Redirecionando para /login.')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  console.log('Token válido, acesso permitido à rota:', pathname)
  return NextResponse.next()
}

export const config = {
  matcher: [
    // Aplica o middleware a todas as rotas, exceto as estáticas
    // Soluciona bug de CSS e JS do lado do cliente
    '/((?!_next/static|favicon.ico).*)',
  ],
}
