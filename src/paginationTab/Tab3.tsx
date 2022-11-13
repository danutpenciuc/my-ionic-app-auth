import React, { useState } from 'react';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonList,
  IonPage,
  IonSearchbar,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import { Breed } from './Tab2';
import { useHistory } from 'react-router';

const Tab3: React.FC = () => {
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [searchBreed, setSearchBreed] = useState<string>('');
  
  const history = useHistory();

  async function fetchBreeds() {
    const url: string = 'https://api.thecatapi.com/v1/breeds';
    const res: Response = await fetch(url);
    res
      .json()
      .then(async (res) => {
       const breedsWithIds: Breed[] = res.map(({id, name}: Breed) => ({id, name}));
        setBreeds(breedsWithIds);
      })
      .catch(err => console.error(err));
  }

  useIonViewWillEnter(async () => {
    await fetchBreeds();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 3</IonTitle>
          <IonButton onClick={() => history.push('/tab1')}>Tab 1</IonButton>
          <IonButton slot='end'onClick={() => history.push('/tab2')}>Tab 2</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonSearchbar
          value={searchBreed}
          debounce={300}
          onIonChange={e => setSearchBreed(e.detail.value!)}>
        </IonSearchbar>
        <IonList>
          {breeds
            .filter(breed => breed.name.indexOf(searchBreed) >= 0)
            .map((breed: Breed) => <IonItem key={breed.id}>{breed.name}</IonItem>)}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Tab3;
