import axios from 'axios';
import { authConfig, baseUrl, getLogger, withLogs } from '../core';
import { Movie } from './movie';

const movieUrl = `http://${baseUrl}/api/movie`;

export const getMovies: (token: string) => Promise<Movie[]> = token => {
  return withLogs(axios.get(movieUrl, authConfig(token)), 'getMovies');
}

export const createMovie: (token: string, movie: Movie) => Promise<Movie[]> = (token, movie) => {
  log(movie, "I am in create movie method");
  return withLogs(axios.post(movieUrl, movie, authConfig(token)), 'createMovie');
}

export const updateMovie: (token: string, movie: Movie) => Promise<Movie[]> = (token, movie) => {
  log(movie, "I am in save movie method");
  return withLogs(axios.put(`${movieUrl}/${movie._id}`, movie, authConfig(token)), 'saveMovie');
}

export const deleteMovie: (token: string, _id: string) => Promise<boolean> = (token, _id) => {
  return withLogs(axios.delete(`${movieUrl}/${_id}`, authConfig(token)), 'deleteMovie');
}

interface MessageData {
  type: string;
  payload: Movie;
}

const log = getLogger('ws');

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
  const ws = new WebSocket(`ws://${baseUrl}`);
  ws.onopen = () => {
    log('web socket onOpen');
    ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
  };
  ws.onclose = () => {
    log('web socket onClose');
  };
  ws.onerror = error => {
    log('web socket onError', error);
  };
  ws.onmessage = messageEvent => {
    log('web socket onMessage');
    onMessage(JSON.parse(messageEvent.data));
  };
  return () => {
    ws.close();
  }
}
