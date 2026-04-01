import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { usePlaces } from "../context/PlacesContext";
import { useAuth } from "../context/AuthContext";

function PlaceDetail() {
  const { pid } = useParams();
  const navigate = useNavigate();
  const { fetchPlaceById, deletePlace } = usePlaces();
  const { userId } = useAuth();

  const [place, setPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadPlace = async () => {
      setLoading(true);
      setError("");

      try {
        const fetched = await fetchPlaceById(pid);
        setPlace(fetched);
      } catch (err) {
        setError(err.message || "Газрын мэдээлэл ачаалж чадсангүй.");
      } finally {
        setLoading(false);
      }
    };

    loadPlace();
  }, [pid, fetchPlaceById]);

  const isOwner = place?.creator === userId;

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <p className="text-sm text-slate-600">Ачаалж байна...</p>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-xl font-semibold text-slate-800">
          Газар олдсонгүй
        </h1>
        {error ? (
          <p className="mt-3 text-sm text-slate-600">{error}</p>
        ) : (
          <p className="mt-3 text-sm text-slate-600">
            Энэ газрын мэдээлэл устсан эсвэл буруу холбоос байна.
          </p>
        )}
        <Link
          to="/"
          className="mt-4 inline-flex rounded bg-slate-800 px-3 py-2 text-sm text-white no-underline hover:bg-slate-700"
        >
          Нүүр хуудас руу буцах
        </Link>
      </div>
    );
  }

  const lat = place?.location?.lat;
  const lng = place?.location?.lng;
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lng);
  const googleMapsUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${lat},${lng}`
    : "";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate(`/${place.creator}/places`);
  };

  const handleDelete = async () => {
    const confirmed = window.confirm("Энэ газрыг устгах уу?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await deletePlace(place.id);
      navigate(`/${place.creator}/places`);
    } catch (err) {
      setError(err.message || "Газар устгах үед алдаа гарлаа.");
    } finally {
      setIsDeleting(false);
    }
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
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTZjnG1SG2KnowrFjK-u399uW68PppgOpeqQA&s";
          }}
        />

        <div className="flex flex-col gap-4 p-5">
          <header>
            <h1 className="text-2xl font-semibold text-slate-800">
              {place.title}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Нийтэлсэн: {place.creatorName}
            </p>
          </header>

          <section>
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Хаяг
            </h2>
            <p className="mt-1 text-slate-700">{place.address}</p>
          </section>

          <section>
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Тайлбар
            </h2>
            <p className="mt-1 whitespace-pre-line text-slate-700">
              {place.description}
            </p>
          </section>

          {hasCoordinates && (
            <section>
              <a
                href={googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                className="w-fit rounded border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-700 no-underline hover:bg-slate-50"
              >
                Google Maps дээр харах
              </a>
            </section>
          )}

          {isOwner && (
            <div className="flex flex-wrap gap-2">
              <Link
                to={`/places/${place.id}`}
                className="rounded border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 no-underline hover:bg-slate-50"
              >
                Засах
              </Link>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded border border-red-400 bg-white px-3 py-2 text-sm text-red-700 hover:bg-red-50"
              >
                {isDeleting ? "Түр хүлээнэ үү..." : "Устгах"}
              </button>
            </div>
          )}
        </div>
      </article>
    </div>
  );
}

export default PlaceDetail;
