import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { MovieEdit, MovieList } from './movies';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import { MovieProvider } from './movies/movieProvider';
import { AuthProvider, Login, PrivateRoute } from './auth';
import Tab1 from './paginationTab/Tab1';
import Tab2 from './paginationTab/Tab2';
import Tab3 from './paginationTab/Tab3';

import { store } from './redux/store';
import { Provider } from 'react-redux';

const App: React.FC = () => {
  return (
    <Provider store={store}>
        <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
              <AuthProvider>
                <Route path="/login" component={Login} exact={true} />
                //<MovieProvider>
                  <PrivateRoute path="/movies" component={MovieList} exact={true} />
                  <PrivateRoute path="/movie" component={MovieEdit} exact={true} />
                  <PrivateRoute path="/movie/:id" component={MovieEdit} exact={true} />
                </MovieProvider>
                <Route exact path="/" render={() => <Redirect to="/movies" />} />
              </AuthProvider>

              <Route path="/tab1" component={Tab1} exact={true} />
              <Route path="/tab2" component={Tab2} exact={true} />
              <Route path="/tab3" component={Tab3} />
            </IonRouterOutlet>
          </IonReactRouter>
        </IonApp>
      </Provider>
    )
}

export default App;
