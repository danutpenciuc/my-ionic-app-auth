import React, { useContext, useState } from 'react';
import { RouteComponentProps } from 'react-router';
import {
  IonButton,
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
import { add, apps } from 'ionicons/icons';
import { getLogger } from '../core';
import { MovieContext } from './movieProvider';
import MovieComp from './movieExt';
import { AuthContext } from '../auth';
import { useAppState } from '../utils/useAppState';
import { useNetwork } from '../utils/useNetwork';
import { useGetMoviesQuery } from '../redux/slices';

const log = getLogger('movieList');


const MovieList: React.FC<RouteComponentProps> = ({ history }) => {
  //const [movies, setMovies] = useState([]);

  const {
      data: movies,
      isLoading,
      isSuccess,
      isError,
      error
  } = useGetMoviesQuery();

  // const [addTodo] = useAddTodoMutation()
  // const [updateTodo] = useUpdateTodoMutation()
  // const [deleteTodo] = useDeleteTodoMutation()
  const { logout } = useContext(AuthContext);
  const { appState } = useAppState();
  const { networkStatus } = useNetwork();

  const handleLogout = () => {
    logout?.();
  }
  log('render');
  return (
    <IonPage>
      <IonHeader>
        {networkStatus.connected ? 'online'  : 'offline'}          {networkStatus.connectionType}
      </IonHeader>
      <IonHeader>
        <IonToolbar>
          <IonTitle slot='start'>{appState.isActive ? "Active app" : "Inactive app" }</IonTitle>
          <IonButton onClick={() => history.push('/tab1')} slot='end'> See cats </IonButton>
        </IonToolbar>
        <IonToolbar>
          <IonTitle>Movie List</IonTitle>
          <IonButton color='danger' slot='end' onClick={handleLogout}>Logout</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={isLoading} message="Fetching movies"/>
        {movies && (
          
          <IonList>
            {movies.map(({ _id, name, rating, releaseDate, booked }) =>
              <MovieComp key={_id} _id={_id} name={name} releaseDate={releaseDate} rating={rating} booked={booked} 
              onEdit={id => history.push(`/Movie/${id}`)} />)}
          </IonList>
        )}
        {isError && (
          <div>{error || 'Failed to fetch movies'}</div>
        )}
        <IonFab vertical="bottom" horizontal="start" slot="fixed">
          <IonFabButton onClick={() => history.push('/Movie')}>
            <IonIcon icon={add}/>
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default MovieList;
