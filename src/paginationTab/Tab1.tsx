import React, { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonContent,
  IonHeader,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonPage,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter
} from '@ionic/react';
import { useHistory } from 'react-router';

const Tab1: React.FC = () => {
  const history = useHistory();
  const [items, setItems] = useState<any[]>([]);
  const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(false);

  async function fetchData() {
    const url: string = 'https://api.thecatapi.com/v1/images/search?limit=4';
    const res: Response = await fetch(url);
    res
      .json()
      .then(async (res) => {
        if (res && res && res.length > 0) {
          const images = res.map((item: any) => item.url);
          console.log('Tab 1 - infinite scrolling - new data loaded');
          setItems([...items, ...images]);
          setDisableInfiniteScroll(images.length < 4);
        } else {
          setDisableInfiniteScroll(true);
        }
      })
      .catch(err => console.error(err));
  }

  useIonViewWillEnter(async () => {
    await fetchData();
  });

  async function searchNext($event: CustomEvent<void>) {
    await fetchData();
    ($event.target as HTMLIonInfiniteScrollElement).complete();
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Tab 1</IonTitle>
          <IonButton onClick={() => history.push('/tab2')}>Tab 2</IonButton>
          <IonButton slot='end' onClick={() => history.push('/tab3')}>Tab 3</IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
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

export default Tab1;
