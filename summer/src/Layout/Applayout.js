import Footer from '../components/Footer';
import NavbarPublic from '../components/NavbarPublic';
import NavbarPrivate from '../components/NavbarPrivate';
function Applayout({ children, userDetails, onLogout, sessionChecked }) {
  if (!sessionChecked) return null;

  const isLoggedIn = !!userDetails?.email;
  const isAdmin = userDetails?.isAdmin;

  return (
    <>
      {isLoggedIn && !isAdmin ? (
        <NavbarPrivate username={userDetails.username} onLogout={onLogout} />
      ) : (
        <NavbarPublic />
      )}
      {children}
      <Footer />
    </>
  );
}


export default Applayout;