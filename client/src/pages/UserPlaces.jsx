import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';
import { useAuth } from '../context/AuthContext';

function UserPlaces() {
  const { uid } = useParams();
  const { places, fetchPlacesByUser } = usePlaces();
  const { userId, isLoggedIn } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadPlaces = async () => {
      setLoading(true);
      setError('');
      try {
        await fetchPlacesByUser(uid);
      } catch (err) {
        setError(err.message || 'Газрын мэдээлэл ачаалж чадсангүй.');
      } finally {
        setLoading(false);
      }
    };

    loadPlaces();
  }, [uid, fetchPlacesByUser]);

  const userPlaces = places.filter((p) => p.creator === uid);
  const ownerName = userPlaces[0]?.creatorName || 'Хэрэглэгч';

  const isOwner = isLoggedIn && userId === uid;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        {ownerName} хэрэглэгчийн газрууд
      </h1>

      {loading && <p className="text-sm text-slate-600">Ачаалж байна...</p>}
      {error && (
        <p className="mb-4 rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && userPlaces.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">
          Энэ хэрэглэгчийн газар олдсонгүй.
          {isOwner && (
            <>
              {' '}<Link to="/places/new" className="underline">
                Газар нэмэх
              </Link>
            </>
          )}
        </p>
      ) : !loading && !error ? (
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-2">
          {userPlaces.map((place) => (
            <li key={place.id}>
              <Link
                to={`/places/${place.id}/detail`}
                className="block overflow-hidden rounded border border-slate-200 bg-white no-underline transition hover:-translate-y-0.5 hover:border-slate-300"
              >
                <img
                  src={place.imageUrl}
                  alt={place.title}
                  className="h-40 w-full object-cover"
                  onError={(e) => {
                    e.target.src =
                      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZjnG1SG2KnowrFjK-u399uW68PppgOpeqQA&s';
                  }}
                />

                <div className="p-4">
                  <h3 className="text-base font-medium text-slate-800">{place.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export default UserPlaces;
