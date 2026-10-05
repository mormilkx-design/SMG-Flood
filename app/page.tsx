import Dashboard from './dashboard';
export default function Home(){return <Dashboard signInHref="/verify-email" initialAuthenticated={process.env.NEXT_PUBLIC_REPORT_AUTH_MODE==='public'}/>;}
