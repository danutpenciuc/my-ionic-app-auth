import React from 'react';
import { IonButton, IonCol, IonHeader, IonRow } from '@ionic/react';
import { Movie } from './movie';

export interface MovieExt extends Movie {
  onEdit: (_id?: string, name?: string, rating?: number, releaseDate?: Date, booked?: boolean) => void;
}

const MovieComp: React.FC<MovieExt> = ({ _id, name, rating, releaseDate, booked, onEdit }) => {
  return (
    <IonHeader>
      <IonRow>
        <IonCol>{name}</IonCol>
        <IonCol>{new Date(releaseDate).toISOString().split('T')[0]}</IonCol>
        <IonCol>{rating}</IonCol>
        <IonCol>{booked ? 'Booked' : 'Not booked'}</IonCol>
        <IonCol> 
          <IonButton fill='outline' onClick={() => onEdit(_id, name, rating, releaseDate, booked)}>View</IonButton>
        </IonCol>
      </IonRow>
    </IonHeader>
  );
};

export default MovieComp;
