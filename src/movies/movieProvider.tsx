import React, { useCallback, useContext, useEffect, useReducer } from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { Movie } from './movie';
import { createMovie, deleteMovie, getMovies, newWebSocket, updateMovie } from './movieApi';
import { AuthContext } from '../auth';

const log = getLogger('movieProvider');

type SaveMovieFn = (token: string, movie: Movie) => Promise<any>;
type DeleteMovieFn = (token: string, id: string) => Promise<any>;

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

interface ActionProps {
  type: string,
  payload?: any,
}

const initialState: MoviesState = {
  fetching: false,
  saving: false,
  deleting: false
};

const FETCH_MOVIES_STARTED = 'FETCH_MOVIES_STARTED';
const FETCH_MOVIES_SUCCEEDED = 'FETCH_MOVIES_SUCCEEDED';
const FETCH_MOVIES_FAILED = 'FETCH_MOVIES_FAILED';
const SAVE_MOVIE_STARTED = 'SAVE_MOVIE_STARTED';
const SAVE_MOVIE_SUCCEEDED = 'SAVE_MOVIE_SUCCEEDED';
const SAVE_MOVIE_FAILED = 'SAVE_MOVIE_FAILED';
const DELETE_MOVIE_STARTED = 'DELETE_MOVIE_STARTED';
const DELETE_MOVIE_SUCCEEDED = 'DELETE_MOVIE_SUCCEEDED';
const DELETE_MOVIE_FAILED = 'DELETE_MOVIE_FAILED';

const reducer: (state: MoviesState, action: ActionProps) => MoviesState =
  (state, { type, payload }) => {
    switch (type) {
      case FETCH_MOVIES_STARTED:
        return { ...state, fetching: true, fetchingError: null };
      case FETCH_MOVIES_SUCCEEDED:
        return { ...state, movies: payload.movies, fetching: false };
      case FETCH_MOVIES_FAILED:
        return { ...state, fetchingError: payload.error, fetching: false };
      case SAVE_MOVIE_STARTED:
        return { ...state, savingError: null, saving: true };
      case SAVE_MOVIE_SUCCEEDED:
        const movies = [...(state.movies || [])];
        const movie = payload.movie;
        const index = movies.findIndex(it => it._id === movie._id);
        if (movie?._id) {
          index === -1 ? movies.splice(0, 0, movie) : movies[index] = movie;
        }
        return { ...state, movies, saving: false };
      case SAVE_MOVIE_FAILED:
        return { ...state, savingError: payload.error, saving: false };
      case DELETE_MOVIE_STARTED:
        return { ...state, deletingError: null, deleting: true}
      case DELETE_MOVIE_SUCCEEDED:
        const movies1 = [...(state.movies || [])];
        const movieId = payload.id;
        let isMovieDeleted = false;
        const index1 = movies1.findIndex(it => it._id === movieId);
        if (index1 > -1) {
          movies1.splice(index1, 1);
          state.movies = movies1;
          isMovieDeleted = true;
        }
        return { ...state, isMovieDeleted, deleting: false };
      case DELETE_MOVIE_FAILED:
        return { ...state, deletingError: payload.error, deleting: false };
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
  const [state, dispatch] = useReducer(reducer, initialState);
  const { movies, fetching, fetchingError, saving, savingError, deleting, deletingError } = state;
  useEffect(getmoviesEffect, [token]);
  useEffect(wsEffect, [token]);
  const saveMovie = useCallback<SaveMovieFn>(saveMovieCallback, [token]);
  const deleteMovieFn = useCallback<DeleteMovieFn>(deleteMovieCallback, [token]);
  const value = { movies, fetching, fetchingError, saving, savingError, deleting, deletingError, saveMovie, deleteMovieFn };
  log('returns');
  return (
    <MovieContext.Provider value={value}>
      {children}
    </MovieContext.Provider>
  );

  function getmoviesEffect() {
    let canceled = false;
    fetchmovies();
    return () => {
      canceled = true;
    }

    async function fetchmovies() {
      if (!token?.trim()) {
        return;
      }
      try {
        log('fetchmovies started');
        dispatch({ type: FETCH_MOVIES_STARTED });
        const movies = await getMovies(token);
        log('fetchmovies succeeded');
        if (!canceled) {
          dispatch({ type: FETCH_MOVIES_SUCCEEDED, payload: { movies } });
        }
      } catch (error) {
        log('fetchmovies failed');
        dispatch({ type: FETCH_MOVIES_FAILED, payload: { error } });
      }
    }
  }

  async function saveMovieCallback(token: string, movie: Movie) {
    try {
      log('saveMovie started');
      dispatch({ type: SAVE_MOVIE_STARTED });
      const savedmovie = await (movie._id ? updateMovie(token, movie) : createMovie(token, movie));
      log('saveMovie succeeded');
      dispatch({ type: SAVE_MOVIE_SUCCEEDED, payload: { movie: savedmovie } });
    } catch (error) {
      log('saveMovie failed');
      dispatch({ type: SAVE_MOVIE_FAILED, payload: { error } });
    }
  }

  async function deleteMovieCallback(token: string, id: string) {
    try {
      log('deleteMovie started');
      dispatch({ type: DELETE_MOVIE_STARTED });
      await deleteMovie(token, id);
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
