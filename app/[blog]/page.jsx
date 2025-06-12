import BlogHero from "../components/BlogHero";
import BlogList from "../components/BlogList";
import Breadcrumbs from "../components/UI/Breadcrumbs";

export default function Blog() {
  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col gap-4">
        <Breadcrumbs />
        <BlogHero />
        <BlogList />
      </div>
    </div>
  );
}
