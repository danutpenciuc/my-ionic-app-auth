import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

export interface Breed {
 id: 'string',
 name: 'string'
}

const Tab2: React.FC = () => {
  const history = useHistory();
  const [breeds, setBreeds] = useState<Breed[]>([]);
  const [items, setItems] = useState<string[]>([]);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

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

  async function fetchData(reset?: boolean) {
    const cats: string[] = reset ? [] : items;
    const url: string = filter ? `https://api.thecatapi.com/v1/images/search?limit=4breed_ids=${filter}` : 'https://api.thecatapi.com/v1/images/search?limit=4';
    const res: Response = await fetch(url);
    res
    .json()
    .then(async (res) => {
      if (res && res && res.length > 0) {
        const images = res.map((item: any) => item.url);
        setItems([...cats, ...images]);
        console.log(images);
        setDisableInfiniteScroll(images.length < 10);
      } else {
        setDisableInfiniteScroll(true);
      }
    })
    .catch(err => console.error(err));
  }

  useEffect(() => {
    fetchData(true);
  }, [filter]);

  async function searchNext($event: CustomEvent<void>) {
    await fetchData();
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  useIonViewWillEnter(async () => {
    await fetchBreeds();
  });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab Two</IonTitle>
          <IonButton onClick={() => history.push('/tab3')}>Tab 3</IonButton>
          <IonButton slot='end'onClick={() => history.push('/tab1')}>Tab 1</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonSelect value={filter} placeholder="Select Breed" onIonChange={e => setFilter(e.detail.value)}>
          {breeds.map(breed => <IonSelectOption key={breed.id} value={breed.name}>{breed.name}</IonSelectOption>)}
        </IonSelect>
        {items.map((item: string, i: number) => {
          return <IonCard key={`${i}`}><img src={item}/></IonCard>
        })}
        <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll}
                           onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
          <IonInfiniteScrollContent
            loadingText="Loading...">
          </IonInfiniteScrollContent>
        </IonInfiniteScroll>
      </IonContent>
    </IonPage>
  );
};

export default Tab2;
