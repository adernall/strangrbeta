import './globals.css'
import { AuthProvider } from '../lib/AuthContext'

export const metadata = {
  title: 'Strangr — A Quiet Place For Loud Ideas',
  description: 'The anti-noise network for makers. No engagement traps. No outrage feed. Just curated spaces and posts that earned the room.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}