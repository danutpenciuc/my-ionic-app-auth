import React, { useContext } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonList, IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { add } from 'ionicons/icons';
import { getLogger } from '../core';
import { MovieContext } from './movieProvider';
import MovieComp from './movieExt';
import { AuthContext } from '../auth';

const log = getLogger('movieList');

const MovieList: React.FC<RouteComponentProps> = ({ history }) => {
  const { movies, fetching, fetchingError, deleting, deletingError, deleteMovieFn } = useContext(MovieContext);
  const { token } = useContext(AuthContext);
  const handleDelete = (id: string) => {
    deleteMovieFn && deleteMovieFn(token, id);
  };
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Movie List</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={fetching} message="Fetching movies"/>
        {movies && (
          <IonList>
            {movies.map(({ _id, name, rating, releaseDate, booked }) =>
              <MovieComp key={_id} _id={_id} name={name} releaseDate={releaseDate} rating={rating} booked={booked} 
              onEdit={id => history.push(`/Movie/${id}`)} onDelete={id => handleDelete(id)} />)}
          </IonList>
        )}
        {fetchingError && (
          <div>{fetchingError.message || 'Failed to fetch movies'}</div>
        )}
        <IonLoading isOpen={deleting} />
        {deletingError && (
          <div>{deletingError.message || 'Failed to delete movie'}</div>
        )}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => history.push('/Movie')}>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default MovieList;
