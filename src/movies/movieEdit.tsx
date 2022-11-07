import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonFooter,
  IonHeader,
  IonInput,
  IonLabel,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { RouteComponentProps } from 'react-router';
import { Movie } from './movie';
import { MovieContext } from './movieProvider';
import { AuthContext } from '../auth';
import { MovieExt } from './movieExt';

const log = getLogger('MovieEdit');

interface MovieEdit extends RouteComponentProps<{
  id?: string;
  name?: string;
  releaseDate?: string;
  rating?: string;
  booked?: string;
}> {}

const MovieEdit: React.FC<MovieEdit> = ({ history, match }) => {
  const { token } = useContext(AuthContext);
  const { movies, saving, savingError, saveMovie, deleting, deletingError, deleteMovieFn } = useContext(MovieContext);
  const [name, setName] = useState('');
  const [releaseDate, setReleaseDate] = useState(new Date());
  const [rating, setRating] = useState(0);
  const [booked, setBooked] = useState(false);
  const [movie, setMovie] = useState<MovieExt>();

  useEffect(() => {
    log('useEffect');
    const routeId = match.params.id;
    const movie = movies?.find(it => it._id === routeId);
    setMovie(movie as MovieExt);
    if (movie) {
      setName(movie.name);
      setReleaseDate(movie.releaseDate);
      setRating(movie.rating);
      setBooked(movie.booked);
    }
  }, [match.params.id, movies]);

  const handleSave = () => {
    const editedMovie = { ...movie, name, releaseDate, rating, booked } as Movie;
    saveMovie && saveMovie(token, editedMovie).then(() => history.goBack());
  };

  const handleDelete = () => {
    const id = movie?._id || '';
    deleteMovieFn && deleteMovieFn(token, id).then(() => history.goBack());
  };

  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit Mode</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLabel>Name:</IonLabel><IonInput style={{ '--background': 'white', '--color':'blue'}} value={name} onIonChange={e => setName(e.detail.value || '')} />
        <IonLabel>Release Date:</IonLabel><IonDatetime value={releaseDate?.toString()} onIonChange={e => setReleaseDate(e.detail.value ? new Date(e.detail.value.toString()) : new Date(0))} />
        <IonLabel>Rating:</IonLabel><IonInput inputMode='numeric' style={{ '--background': 'white', '--color':'blue'}} value={rating} onIonChange={e => setRating( parseFloat(e.detail.value ? e.detail.value : '0'))} />
        <IonLabel>Booked: </IonLabel><IonCheckbox checked={booked} onIonChange={e => setBooked(e.detail.checked)} />          
        <IonLoading isOpen={saving} />
        {savingError && (
          <div>{savingError.message || 'Failed to save movie'}</div>
        )}
        
        <IonLoading isOpen={deleting} />
        {deletingError && (
          <div>{deletingError.message || 'Failed to delete movie'}</div>
        )}
      </IonContent>
      {movie && <IonFooter>
      <IonToolbar>
          <IonButtons>
            <IonButton expand='full' color='danger' onClick={handleDelete}>
              Delete
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonFooter>}
    </IonPage>
  );
};

export default MovieEdit;
