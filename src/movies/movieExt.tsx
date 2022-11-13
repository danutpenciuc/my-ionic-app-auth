import React from 'react';
import { IonButton, IonLabel, IonHeader, IonItem, IonRow } from '@ionic/react';
import { Movie } from './movie';

export interface MovieExt extends Movie {
  onEdit: (_id?: string, name?: string, rating?: number, releaseDate?: Date, booked?: boolean) => void;
}

const MovieComp: React.FC<MovieExt> = ({ _id, name, rating, releaseDate, booked, onEdit }) => {
  return (
    <div style={{"height": "300px"}}>
      <IonItem>
        <IonLabel>{name}</IonLabel>
        <IonLabel>{new Date(releaseDate).toISOString().split('T')[0]}</IonLabel>
        <IonLabel>{rating}</IonLabel>
        <IonLabel>{booked ? 'Booked' : 'Not booked'}</IonLabel>
        <IonButton fill='outline' onClick={() => onEdit(_id, name, rating, releaseDate, booked)}>View</IonButton>
      </IonItem>
    </div>
  );
};

export default MovieComp;
