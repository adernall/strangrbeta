import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const url  = new URL(request.url)
  const code = url.searchParams.get('code')

  if (code) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name)              { return cookieStore.get(name)?.value },
          set(name, value, opts) { cookieStore.set({ name, value, ...opts }) },
          remove(name, opts)     { cookieStore.set({ name, value: '', ...opts }) },
        },
      }
    )

    const { data } = await supabase.auth.exchangeCodeForSession(code)

    if (data?.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', data.user.id)
        .single()

      if (!profile?.username) {
        return NextResponse.redirect(new URL('/setup-profile', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/feed', request.url))
}