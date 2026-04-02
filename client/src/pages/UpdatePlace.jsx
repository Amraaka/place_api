import { useEffect, useState } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import PlaceForm from '../components/PlaceForm';

function UpdatePlace() {
  const { pid } = useParams();
  const { isLoggedIn, authChecked, userId } = useAuth();
  const { fetchPlaceById, updatePlace } = usePlaces();
  const navigate = useNavigate();

  const [place, setPlace]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    fetchPlaceById(pid)
      .then(setPlace)
      .catch((err) => setError(err.message || 'Газрын мэдээлэл ачаалж чадсангүй.'))
      .finally(() => setLoading(false));
  }, [pid, fetchPlaceById]);

  if (!authChecked || loading) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <p className="text-center text-sm text-slate-600">Ачаалж байна...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/authenticate" replace />;

  if (!place) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <p className="text-sm text-red-700">{error || 'Газар олдсонгүй.'}</p>
      </div>
    );
  }

  if (place.creator !== userId) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <p className="text-sm text-slate-600">Та зөвхөн өөрийнхөө газрыг засах боломжтой.</p>
      </div>
    );
  }

  const initialValues = {
    title:       place.title,
    description: place.description,
    imageUrl:    place.imageUrl,
    address:     place.address,
    lng:         String(place.location?.lng ?? ''),
    lat:         String(place.location?.lat ?? ''),
  };

  const handleSubmit = async (formData) => {
    await updatePlace(pid, formData);
    navigate(`/${place.creator}/places`);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Газрын мэдээлэл засах</h1>
      <PlaceForm initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Хадгалах" />
    </div>
  );
}

export default UpdatePlace;
