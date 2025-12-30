import Link from 'next/link'

export default function NotFound() {
    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            textAlign: 'center',
            gap: '1rem'
        }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Not Found</h2>
            <p>Could not find requested resource</p>
            <Link href="/" style={{ color: 'blue', textDecoration: 'underline' }}>
                Return Home
            </Link>
        </div>
    )
}
