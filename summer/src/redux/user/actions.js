export const SET_USER = "SET_USER";
export const CLEAR_USER = "CLEAR_USER";

export const restoreUserSession = () => async (dispatch) => {
  try {
    const res = await fetch("/api/auth/check", {
      credentials: "include" // ⬅️ IMPORTANT to send cookie
    });

    const data = await res.json();

    if (res.ok && data.success) {
      dispatch({
        type: SET_USER,
        payload: data.userDetails,
      });
    } else {
      dispatch({ type: CLEAR_USER }); // optional
    }
  } catch (error) {
    console.error("Session restore failed:", error);
  }
};
