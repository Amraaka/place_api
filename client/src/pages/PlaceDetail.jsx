import { Link, useNavigate, useParams } from 'react-router-dom';
import { usePlaces } from '../context/PlacesContext';

function PlaceDetail() {
  const { pid } = useParams();
  const navigate = useNavigate();
  const { places } = usePlaces();

  const place = places.find((p) => p.id === pid);

  if (!place) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-xl font-semibold text-slate-800">Газар олдсонгүй</h1>
        <p className="mt-3 text-sm text-slate-600">
          Энэ газрын мэдээлэл устсан эсвэл буруу холбоос байна.
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex rounded bg-slate-800 px-3 py-2 text-sm text-white no-underline hover:bg-slate-700"
        >
          Нүүр хуудас руу буцах
        </Link>
      </div>
    );
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(`/${place.creator}/places`);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8">
      <button
        type="button"
        onClick={handleBack}
        className="mb-4 rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
      >
        Буцах
      </button>

      <article className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <img
          src={place.imageUrl}
          alt={place.title}
          className="h-64 w-full object-cover sm:h-80"
          onError={(e) => {
            e.target.src =
              'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZjnG1SG2KnowrFjK-u399uW68PppgOpeqQA&s';
          }}
        />

        <div className="flex flex-col gap-4 p-5">
          <header>
            <h1 className="text-2xl font-semibold text-slate-800">{place.title}</h1>
            <p className="mt-1 text-sm text-slate-500">Нийтэлсэн: {place.creatorName}</p>
          </header>

          <section>
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Хаяг</h2>
            <p className="mt-1 text-slate-700">{place.address}</p>
          </section>

          <section>
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">Тайлбар</h2>
            <p className="mt-1 whitespace-pre-line text-slate-700">{place.description}</p>
          </section>
        </div>
      </article>
    </div>
  );
}

export default PlaceDetail;
