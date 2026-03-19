import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { PlacesProvider } from './context/PlacesContext';

import Navigation from './components/Navigation';

import Users        from './pages/Users';
import UserPlaces   from './pages/UserPlaces';
import Authenticate from './pages/Authenticate';
import NewPlace     from './pages/NewPlace';
import UpdatePlace  from './pages/UpdatePlace';
import PlaceDetail  from './pages/PlaceDetail';

function App() {
  return (
    <AuthProvider>
      <PlacesProvider>
        <BrowserRouter>
          <div className="flex min-h-svh flex-col bg-slate-100 text-slate-800 antialiased">
            <Navigation />

            <main className="flex-1">
              <Routes>
                <Route path="/"             element={<Users />} />
                <Route path="/:uid/places"  element={<UserPlaces />} />
                <Route path="/authenticate" element={<Authenticate />} />

                <Route path="/places/new"   element={<NewPlace />} />
                <Route path="/places/:pid/detail" element={<PlaceDetail />} />
                <Route path="/places/:pid"  element={<UpdatePlace />} />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </PlacesProvider>
    </AuthProvider>
  );
}

export default App;
