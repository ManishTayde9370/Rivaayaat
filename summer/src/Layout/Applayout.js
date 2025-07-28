import Footer from '../components/Footer';
import NavbarPublic from '../components/NavbarPublic';
import NavbarPrivate from '../components/NavbarPrivate';
import React from 'react';

function Applayout({ children, userDetails, onLogout, sessionChecked }) {
  if (!sessionChecked) return null;

  const isLoggedIn = !!userDetails?.email;
  const isAdmin = userDetails?.isAdmin;

  // Inject onLogout prop only for Dashboard
  let content = children;
  if (React.isValidElement(children) && children.type && children.type.name === 'Dashboard') {
    content = React.cloneElement(children, { onLogout });
  }

  return (
    <>
      {isLoggedIn && !isAdmin ? (
        <NavbarPrivate username={userDetails.username} onLogout={onLogout} />
      ) : (
        <NavbarPublic />
      )}
      {content}
      <Footer />
    </>
  );
}

export default Applayout;