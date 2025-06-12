import React from "react";
import BlogTile from "./BlogTile";
import H3 from "../components/UI/Texts/H3";
import { TbFlameFilled } from "react-icons/tb";

export default function BlogList() {
  return (
    <div className="grid lg:grid-cols-4 grid-cols-2 gap-8 w-full py-16">
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
      <BlogTile />
    </div>
  );
}
