// src/Layout/PublicLayout.js
import NavbarPublic from '../components/NavbarPublic';
import Footer from '../components/Footer';

function PublicLayout({ children }) {
  return (
    <>
      <NavbarPublic />
      {children}
      <Footer />
    </>
  );
}

export default PublicLayout;
