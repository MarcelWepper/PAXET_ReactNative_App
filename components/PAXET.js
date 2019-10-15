import { combineReducers } from "redux";

const INITIAL_STATE = {
  //States für User
  current: [],
  firstName: "",
  lastName: "",
  adress: "",
  accepted: "",
  delivered: "",
  coupons: "",
  key: "",
  email: "",
  pricetag: "",
  credit: "0",
  verwendungszweck: "Auszahlung",
  role: "",

  //States für packages
  delivery: "",
  date: "",
  comment: ""
};

/*
 * action creators
 */

export function addUserFName(text) {
  return {
    type: ADD_USERFNAME
  };
}

/*
 * action types
 */

export const ADD_USERFNAME = "ADD_USERFNAME";

const PAXET = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    //Funktionen für USER
    case ADD_USERFNAME:
      return {
        firstName: action.firstName,
        lastName: action.lastName,
        key: action.key,
        email: action.email,
        delivered: action.delivered,
        accepted: action.accepted,
        credit: action.credit,
        verwendungszweck: action.verwendungszweck,
        packagekey: action.packagekey,
        pricetag: action.pricetag,
        role: action.role
      };

    default:
      return state;
  }
};

export default combineReducers({
  user: PAXET
});
