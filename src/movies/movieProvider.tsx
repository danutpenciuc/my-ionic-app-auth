import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { Movie } from './movie';
import {  newWebSocket} from './movieApi'; 
import { AuthContext } from '../auth';
import { useAddMoviesMutation, useDeleteMovieMutation, useGetMoviesQuery, useUpdateMoviesMutation } from '../redux/slices';
import { add } from 'ionicons/icons';
import { MovieExt } from './movieExt';

const log = getLogger('movieProvider');

type SaveMovieFn = (movie: Movie) => Promise<any>;
type DeleteMovieFn = (id: string) => Promise<any>;

export interface MoviesState {
  movies?: Movie[],
  fetching: boolean,
  fetchingError?: Error | null,
  saving: boolean,
  savingError?: Error | null,
  deleting: boolean,
  deletingError?: Error | null,
  saveMovie?: SaveMovieFn,
  deleteMovieFn?: DeleteMovieFn
}

export interface ActionProps {
  type: string,
  payload?: any,
}

export const initialState: MoviesState = {
  fetching: false,
  saving: false,
  deleting: false
};

export const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
export const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
export const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';
export const SAVE_MOVIE_STARTED = 'SAVE_MOVIE_STARTED';
export const SAVE_MOVIE_SUCCEEDED = 'SAVE_MOVIE_SUCCEEDED';
export const SAVE_MOVIE_FAILED = 'SAVE_MOVIE_FAILED';
export const DELETE_MOVIE_STARTED = 'DELETE_MOVIE_STARTED';
export const DELETE_MOVIE_SUCCEEDED = 'DELETE_MOVIE_SUCCEEDED';
export const DELETE_MOVIE_FAILED = 'DELETE_MOVIE_FAILED';

export const movieReducer: (state: MoviesState, action: ActionProps) => MoviesState =
  (state, action) => {
    switch (action.type) {
      case FETCH_MOVIES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_MOVIES_SUCCEEDED:
        return { ...state, movies: action.payload.movies, fetching: false };
      case FETCH_MOVIES_FAILED:
        return { ...state, fetchingError: action.payload.error, fetching: false };
      case SAVE_MOVIE_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_MOVIE_SUCCEEDED:
        const movies = [...(state.movies || [])];
        const movie = action.payload.movie;
        const index = movies.findIndex(it => it._id === movie._id);
        if (movie?._id) {
          index === -1 ? movies.splice(0, 0, movie) : movies[index] = movie;
        }
        return { ...state, movies, saving: false };
      case SAVE_MOVIE_FAILED:
        return { ...state, savingError: action.payload.error, saving: false };
      case DELETE_MOVIE_STARTED:
        return { ...state, deletingError: null, deleting: true}
      case DELETE_MOVIE_SUCCEEDED:
        const movies1 = [...(state.movies || [])];
        const movieId = action.payload.id;
        let isMovieDeleted = false;
        const index1 = movies1.findIndex(it => it._id === movieId);
        if (index1 > -1) {
          movies1.splice(index1, 1);
          state.movies = movies1;
          isMovieDeleted = true;
        }
        return { ...state, isMovieDeleted, deleting: false };
      case DELETE_MOVIE_FAILED:
        return { ...state, deletingError: action.payload.error, deleting: false };
      default:
        return state;
    }
  };

export const MovieContext = React.createContext<MoviesState>(initialState);

interface MovieProviderProps {
  children: PropTypes.ReactNodeLike,
}

export const MovieProvider: React.FC<MovieProviderProps> = ({ children }) => {
  const { token } = useContext(AuthContext);
  const [state, dispatch] = useReducer(movieReducer, initialState);
  const { fetching, fetchingError, saving, savingError, deleting, deletingError } = state;

  const [ addMovie ] = useAddMoviesMutation();
  const [ updateMovie ] = useUpdateMoviesMutation();
  const [ deleteMovie ] = useDeleteMovieMutation();

  const {
    data: movies,
} = useGetMoviesQuery();

 // useEffect(getmoviesEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveMovie = useCallback<SaveMovieFn>(saveMovieCallback, []);
  const deleteMovieFn = useCallback<DeleteMovieFn>(deleteMovieCallback, []);
  const value = { movies, fetching, fetchingError, saving, savingError, deleting, deletingError, saveMovie, deleteMovieFn };
  log('returns');
  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );

  // function getmoviesEffect() {
  //   let canceled = false;
  //   fetchmovies();
  //   return () => {
  //     canceled = true;
  //   }

  //   async function fetchmovies() {
  //     try {
  //       log('fetchmovies started');
  //       dispatch({ type: FETCH_MOVIES_STARTED });
  //       log('fetchmovies succeeded');
  //       if (!canceled) {
  //         dispatch({ type: FETCH_MOVIES_SUCCEEDED, payload: { movies } });
  //       }
  //     } catch (error) {
  //       log('fetchmovies failed');
  //       dispatch({ type: FETCH_MOVIES_FAILED, payload: { error } });
  //     }
  //   }
  // }

  async function saveMovieCallback(movie: Movie) {
    try {
      log('saveMovie started');
      dispatch({ type: SAVE_MOVIE_STARTED });
      const savedmovie = await (movie._id ? updateMovie(movie as MovieExt) : addMovie(movie as MovieExt));
      log('saveMovie succeeded');
      dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie: savedmovie } });
    } catch (error) {
      log('saveMovie failed');
      dispatch({ type: SAVE_MOVIE_FAILED, payload: { error } });
    }
  }

  async function deleteMovieCallback(id: string) {
    try {
      log('deleteMovie started');
      dispatch({ type: DELETE_MOVIE_STARTED });
      await deleteMovie(id);
      log('delete movie succeeded');
      dispatch({ type: DELETE_MOVIE_SUCCEEDED, payload: { id: id } });
    } catch (error) {
      log('delete movie failed');
      dispatch({ type: DELETE_MOVIE_FAILED, payload: { error } });
    }
  }

  function wsEffect() {
    let canceled = false;
    log('wsEffect - connecting');
    let closeWebSocket: () => void;
    if (token?.trim()) {
      closeWebSocket = newWebSocket(token, message => {
        if (canceled) {
          return;
        }
        const { type, payload: movie } = message;
        log(`ws message, movie ${type}`);
        if (type === 'created' || type === 'updated') {
          dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie } });
        }
      });
    }
    return () => {
      log('wsEffect - disconnecting');
      canceled = true;
      closeWebSocket?.();
    }
  }
};
