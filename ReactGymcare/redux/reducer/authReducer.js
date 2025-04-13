import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  SET_USER_INFO,
} from "../actions/authActions";

const initialState = {
  loading: false,
  token: null,
  errorLogin: null,
  successLogin: false,
  user: null,
};

const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return {
        ...state,
        loading: true,
        token: null,
        errorLogin: null,
        user: null,
      };
    case LOGIN_SUCCESS:
      return {
        loading: false,
        token: action.payload.access_token,
        errorLogin: null,
        successLogin: true,
      };
    case SET_USER_INFO:
      return {
        ...state,
        user: action.payload,
      };
    case LOGIN_FAILURE:
      return {
        loading: false,
        token: null,
        errorLogin: action.payload,
        successLogin: false,
        user: null,
      };
    case LOGOUT:
      return {
        ...initialState,
      };
    default:
      return state;
  }
};

export default AuthReducer;
