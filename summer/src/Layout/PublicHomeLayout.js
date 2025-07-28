// src/Layout/PublicHomeLayout.js
import NavbarPublic from '../components/NavbarPublic';

function PublicHomeLayout({ children }) {
  return (
    <>
      <NavbarPublic />
      {children}
      {/* Footer intentionally excluded for public homepage */}
    </>
  );
}

export default PublicHomeLayout; 