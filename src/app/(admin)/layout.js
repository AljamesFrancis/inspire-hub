import Navigation from "./components/Navigation";
import Footer from './components/Footer';

export default function Layout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navigation />

      {/* Main content that grows to push footer down */}
      <main className="flex-grow pt-16 pb-16"> {/* Added pb-16 to prevent footer overlap */}
        {children}
      </main>
    </div>
  );
}