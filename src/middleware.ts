import { NextRequest, NextResponse } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  console.log('Middleware executado para:', pathname)

  // Ignorar rotas públicas específicas, mas redirecionar caso o token exista
  if (pathname === '/login') {
    const payload = req.cookies.get('vca-tech-authorize')?.value

    if (payload) {
      try {
        const { user, token } = JSON.parse(payload)
        if (user && token) {
          console.log(
            'Token encontrado na rota /login. Redirecionando para /dashboard/setores.',
          )
          return NextResponse.redirect(new URL('/dashboard/setores', req.url))
        }
      } catch (error) {
        console.error('Erro ao analisar o payload:', error)
      }
    }

    console.log('Acesso permitido à rota /login.')
    return NextResponse.next()
  }

  if (pathname.startsWith('/public')) {
    console.log('Rota pública detectada:', pathname)
    return NextResponse.next()
  }

  // Obter o payload do cookie
  const payload = req.cookies.get('vca-tech-authorize')?.value
  console.log('Payload encontrado:', payload)

  if (!payload) {
    console.log('Payload ausente ou inválido. Redirecionando para /login.')
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    const { user, token } = JSON.parse(payload)

    if (!user || !token) {
      console.log('Payload incompleto. Redirecionando para /login.')
      return NextResponse.redirect(new URL('/login', req.url))
    }

    console.log(`Acesso concedido ao usuário: ${user} à rota ${pathname}`)
    return NextResponse.next()
  } catch (error) {
    console.error('Erro ao analisar o payload:', error)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: [
    // Aplica o middleware a todas as rotas, exceto as estáticas
    // Soluciona bug de CSS e JS do lado do cliente
    '/((?!_next/static|favicon.ico).*)',
  ],
}
