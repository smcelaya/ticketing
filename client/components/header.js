import Link from 'next/link';

export const Header = ({ currentUser }) => {

    const links = [
        !currentUser && { label: 'Sign In', href: '/auth/signin' },
        !currentUser && { label: 'Sign Up', href: '/auth/signup' },
        currentUser && { label: 'Sell Tickets', href: '/tickets/new' },
        currentUser && { label: 'My Orders', href: '/orders' },
        currentUser && { label: 'Sign Out', href: '/auth/signout' },
    ].filter(link => link);

    return (
        <div className="navbar navbar-light bg-light">
            <div className="container-fluid">
                <Link href="/">
                    <a className="navbar-brand">GitTix</a>
                </Link>

                <div className="d-flex justify-content-end">
                    <ul className="nav d-flex align-items-center">
                        {
                            links.map(({ label, href }) => (
                                <li key={href} className="nav-item">
                                    <Link href={href}>
                                        <a className="nav-link">{label}</a>
                                    </Link>
                                </li>
                            ))
                        }
                    </ul>
                </div>
            </div>
        </div>
    );
};
