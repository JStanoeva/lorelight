import { useParams } from "react-router";
import NotFoundState from "../../../shared/components/NotFoundState.jsx";
import AllCollectionView from "../components/AllCollectionView.jsx";
import { getProfileTab, isProfileCollection } from "../utils/getProfileTab.js";
import "../styles/profile.css";

// "/profile/:userId/:collection": every project, lore entry, saved entry or appreciated entry of
// one creator (the page behind a profile tab's "All …" link). An unknown collection shows Not Found
// at once, without loading anything.
export default function ProfileCollectionPage() {
  const { userId, collection } = useParams();

  if (!isProfileCollection(collection)) {
    return (
      <section className="page">
        <NotFoundState />
      </section>
    );
  }

  return <AllCollectionView userId={userId} tab={getProfileTab(collection)} />;
}
