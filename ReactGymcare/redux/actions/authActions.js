import api, { endpoint } from "../../configs/API";
export const LOGIN_REQUEST = "LOGIN_REQUEST";
export const LOGIN_SUCCESS = "LOGIN_SUCCESS";
export const LOGIN_FAILURE = "LOGIN_FAILURE";
export const LOGOUT = "LOGOUT";
export const SET_USER_INFO = "SET_USER_INFO";


export const setUserInfo = (userData) => ({
  type: SET_USER_INFO,
  payload: userData,
});

const LoginAction = (username, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST });
  try {
    const response = await api.post(endpoint.login, {
      username,
      password,
      client_id: "cMLMR6Pw4rN354rQe315815Bo23ldylBEl4Naoyt",
      client_secret:
        "82fLiHAYavDzNaeDJxs8obugctFXGz53iFhB4Q8uKViwCne9zfW4Q6ghblhwQwOzRgesIBOdANDgzK7P6fZJASoDSadUlZFaHSilOOjEMS2lmBTpzUV4atwfLRUDnbEM",
      grant_type: "password",
    });

    const accessToken = response.data.access_token;
    
    dispatch({ type: LOGIN_SUCCESS, payload: response.data });

    const userResponse = await api.get(endpoint.currentUser, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    dispatch(setUserInfo(userResponse.data));    

  } catch (error) {
    dispatch({
      type: LOGIN_FAILURE,
      payload: error.response ? error.response.data.error : error.message,
    });
  }
};

export const LogoutAction = () => (dispatch) => {
  dispatch({ type: LOGOUT });
};

export default LoginAction
