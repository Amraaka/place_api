import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePlaces } from '../context/PlacesContext';
import PlaceForm from '../components/PlaceForm';

function NewPlace() {
  const { isLoggedIn, authChecked, userId } = useAuth();
  const { addPlace } = usePlaces();
  const navigate = useNavigate();

  if (!authChecked) {
    return (
      <div className="mx-auto w-full max-w-md px-4 py-8">
        <p className="text-center text-sm text-slate-600">Нэвтрэлтийн төлөв шалгаж байна...</p>
      </div>
    );
  }

  if (!isLoggedIn) return <Navigate to="/authenticate" replace />;

  const handleSubmit = async (formData) => {
    await addPlace(formData);
    navigate(`/${userId}/places`);
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">Шинэ газар нэмэх</h1>
      <PlaceForm onSubmit={handleSubmit} submitLabel="Газар нэмэх" />
    </div>
  );
}

export default NewPlace;
