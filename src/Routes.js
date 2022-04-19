import React from 'react';
import { Provider } from 'react-redux';
import { browserHistory, Route, Router } from 'react-router';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from './redux/store';
import App from './App';
import NotFound from './pages/NotFound';
import Home from './pages/Home';
import TraineeLogin from './pages/TraineeLogin';
import PrincipalLogin from "./components/Principle/PrincipalLogin";
import Otp from "./components/Otp";
import Welcome from "./components/Welcome";

class Routes extends React.Component {
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <Router history={browserHistory}>
            <Route component={App}>
              <Route exact path="/" components={{ component: Home }} />
              <Route exact path="/principal-login" components={{ component: PrincipalLogin }} />
              <Route exact path="/trainee-login" components={{ component: TraineeLogin }} />
              <Route exact path="/verify-otp" components={{ component: Otp }} />
              <Route exact path="/welcome" components={{ component: Welcome }} />
              <Route path="*" components={{ component: NotFound }} />
            </Route>
          </Router>
        </PersistGate>
      </Provider>
    );
  }
}

export default Routes;
