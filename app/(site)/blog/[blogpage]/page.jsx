import React from "react";
import BlogTile from "@/app/components/BlogTile";
import Breadcrumbs from "@/app/components/UI/Breadcrumbs";

export default function BlogPage() {
  return (
    <div className="w-full xl:pt-28 pt-20 xl:pb-8 pb-4 px-4 xl:px-12">
      <div className="flex flex-col gap-4">
        <Breadcrumbs />
      </div>
    </div>
  );
}
