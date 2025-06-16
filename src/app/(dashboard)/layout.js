import Sidenav from "./components/Sidenav";
import Footir from "./components/Footir.jsx";

export default function Layout({ children }) {
  return (
    <>
      <Sidenav />
      {children}
      <Footir />
    </>
  );
}
