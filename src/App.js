
import './App.css';
import { Route, Switch, BrowserRouter, Redirect } from "react-router-dom";
import Login from './pages/Login';
import Home from './pages/Home';
import Header from './pages/Header';
import { UserProvider } from './firebase/UserProvider';
import PageRoute from './route/PageRoute';
import Default from './pages/Default';
import TestPage from './pages/TestPage';
import { UserPrivilageProvider } from './firebase/UserPrivilageProvider';
import PrivateDMSRoute from './route/PrivateDMSRoute';
import SearchDonor from './pages/SearchDonor';
import DonorDetails from './pages/DonorDetails';


function App() {
  return (
    <>
      <UserProvider>
        <UserPrivilageProvider>
          <BrowserRouter>
          
            <Header />
            
            <Switch>
              <PageRoute exact path ="/home" component={Home}/>
              <PrivateDMSRoute exact path ="/test" component={TestPage}/>
              <PrivateDMSRoute exact path ="/donorsearch" component={SearchDonor}/>
              <PrivateDMSRoute exact path ="/donordetails/:donorId" component={DonorDetails}/>
              {/* <Route exact path="/test" component={TestPage}/> */}
              <Route exact path="/login" component={Login}/>
              <Route exact path="/">
                <Redirect to="/login"/>
              </Route>
              <Default notfound/>
            </Switch>
            
          </BrowserRouter>
          </UserPrivilageProvider>
      </UserProvider>
    </>
  );
}

export default App;
