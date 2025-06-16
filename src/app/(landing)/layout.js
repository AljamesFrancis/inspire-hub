import Topnav from './components/Topnav';
import Footer from './components/Footer';

export default function Layout({ children }) {
  return (
    <>
      <Topnav />
      {children}
      <Footer />
    </>
  );
}
