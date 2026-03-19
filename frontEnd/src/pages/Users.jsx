import { Link } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';

function Users() {
  const { places } = usePlaces();
  console.log('Places:', places);

  const usersMap = {};
  places.forEach((place) => {
    if (!usersMap[place.creator]) {
      usersMap[place.creator] = {
        userId: place.creator,
        userName: place.creatorName,
        placeCount: 0,
      };
    }
    usersMap[place.creator].placeCount++;
  });

  const users = Object.values(usersMap);

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <h1 className="mb-4 text-xl font-semibold text-slate-800">
        Бүх хэрэглэгч
      </h1>

      {users.length === 0 ? (
        <p className="mt-8 text-sm text-slate-600">
          Одоогоор хэн ч газар нийтлээгүй байна.{' '}
          <Link to="/authenticate" className="underline">
            Бүртгүүлэх
          </Link>{' '}
          хийгээд анхны нь болоорой!
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {users.map((user) => (
            <li
              key={user.userId}
              className="flex items-center gap-3 rounded border border-slate-200 bg-white p-4"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-300 bg-slate-100 text-sm font-semibold text-slate-700">
                {user.userName.charAt(0).toUpperCase()}
              </div>

              <div className="flex-1">
                <h3 className="text-base font-medium text-slate-800">
                  {user.userName}
                </h3>
                <p className="text-sm text-slate-500">
                  {user.placeCount} газар
                </p>
              </div>

              <Link
                to={`/${user.userId}/places`}
                className="rounded bg-slate-800 px-3 py-1.5 text-sm text-white no-underline hover:bg-slate-700"
              >
                Газруудыг харах
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Users;
