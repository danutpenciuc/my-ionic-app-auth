import React from 'react';
import { IonButton, IonCol, IonHeader, IonRow } from '@ionic/react';
import { Movie } from './movie';

interface MovieExt extends Movie {
  onEdit: (_id?: string, name?: string, rating?: number, releaseDate?: Date, booked?: boolean) => void;
  onDelete: (_id: string) => void;
}

const MovieComp: React.FC<MovieExt> = ({ _id, name, rating, releaseDate, booked, onEdit, onDelete }) => {
  return (
    <IonHeader>
      <IonRow>
        <IonCol>{name}</IonCol>
        <IonCol>{new Date(releaseDate).toISOString().split('T')[0]}</IonCol>
        <IonCol>{rating}</IonCol>
        <IonCol>{booked ? 'Yes' : 'No'}</IonCol>
        <IonCol> 
          <IonButton onClick={() => _id ? onDelete(_id) : console.log("couldn't retrieve id")}>Delete</IonButton>
          <IonButton onClick={() => onEdit(_id, name, rating, releaseDate, booked)}>Edit</IonButton>
        </IonCol>
      </IonRow>
    </IonHeader>
  );
};

export default MovieComp;
