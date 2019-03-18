/*
  Syntax and Convention Reference:
  https://github.com/erikras/ducks-modular-redux
  http://blog.jakoblind.no/reduce-redux-boilerplate/
*/

import { combineReducers } from 'redux';
import { interval, of } from 'rxjs';
import { ajax } from 'rxjs/ajax';
import { mergeMap, mapTo, map, takeUntil, filter, catchError } from 'rxjs/operators';

import { combineEpics, ofType } from 'redux-observable';

const actionPrefix = `BlocklistPage/Blocklist/`;

//Action Type
const FETCH_START = actionPrefix + `FETCH_START`;
const FETCH_FULFILLED = actionPrefix + `FETCH_FULFILLED`;
const FETCH_REJECTED = actionPrefix + `FETCH_REJECTED`;
const POLLING_START = actionPrefix + `POLLING_START`;
const POLLING_STOP = actionPrefix + `POLLING_STOP`;
const FILTER_SET = actionPrefix + `FILTER_SET`;
const FILTER_TOGGLE = actionPrefix + `FILTER_TOGGLE`;

//Action Creator
export const fetchStart = () => ({ type: FETCH_START });
export const fetchFulfilled = payload => ({ type: FETCH_FULFILLED, payload });
export const fetchRejected = ( payload, error ) => ({ type: FETCH_REJECTED, payload, error });
export const pollingStart = () => ({ type: POLLING_START });
export const pollingStop = () => ({ type: POLLING_STOP });
export const filterSet = (enabled) => ({ type: FILTER_SET }, enabled);
export const filterToggle = () => ({ type: FILTER_TOGGLE });

//Epic
const startEpic = action$ => action$.pipe(
  ofType(POLLING_START),
  mapTo(fetchStart()),
);

const fetchEpic = ( action$, state$ ) => action$.pipe(
  ofType(POLLING_START),
  mergeMap(action =>
    interval(500).pipe(
      mergeMap(action => {
          let { value: {blocklistPage: { blocklist: { filter } }}} = state$;
          // console.log(state$);
          return ajax({ url: `/api/mongodb/get_blocks?filter=${filter?`true`:`false`}`, timeout: 1000, responseType: "json"}).pipe(
            map(res => fetchFulfilled(res.response)),
            catchError(error => of(fetchRejected(error.response, { status: error.status })))
          )
        }),
      takeUntil(action$.pipe(
        ofType(POLLING_STOP, POLLING_START, FETCH_REJECTED),
      ))
    )
  ),
);

const filterToggleEpic = action$ => action$.pipe(
  ofType(FILTER_TOGGLE),
  mapTo(pollingStart()),
);


export const combinedEpic = combineEpics(
  startEpic,
  fetchEpic,
  filterToggleEpic,
);


//Reducer
const initialState = {
  payload: [],
  error: null
}

const dataReducer = (state=initialState, action) => {
    switch (action.type) {
      case FETCH_START:
          return initialState;

      case FETCH_FULFILLED:
        return {
          ...state,
          payload: action.payload,
          error: null
        };
      case FETCH_REJECTED:
        return {
          ...state,
          payload: action.payload,
          error: action.error
        };
      default:
        return state;
    }
  };

const isFetchingReducer = (state = false, action) => {
  switch (action.type) {
    case FETCH_START:
      return true;

    case FETCH_FULFILLED:
    case FETCH_REJECTED:
      return false;

    default:
      return state;
  }
};

const filterReducer = (state = false, action) => {
  switch (action.type) {
    case FILTER_SET:
      return !!action.enabled;

    case FILTER_TOGGLE:
      return !state;

    default:
      return state;
  }
};

export const combinedReducer = combineReducers({
  data: dataReducer,
  isFetching: isFetchingReducer,
  filter: filterReducer,
})
