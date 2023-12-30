import Link from 'next/link'

export const Header = () => {
  return (
    <header>
      <nav className="lg container mx-auto lg:w-2/5 lg:px-2">
        <div className="container flex items-center justify-between">
          <Link className="text-2xl font-medium" href="/">
            takumines
          </Link>
          <div>
            <ul className="flex items-center py-4 text-sm">
              <li className="block p-2 transition-all duration-75 hover:text-sky-900">
                <Link href="/">Home</Link>
              </li>
              <li className="block p-2 transition-all duration-75 hover:text-sky-900">
                <Link href="#">About</Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  )
}
