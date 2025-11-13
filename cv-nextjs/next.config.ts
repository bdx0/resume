import type { NextConfig } from "next";
import withMDX from "@next/mdx";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },
  // Configure pageExtensions to include md/mdx files
  pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
  // Optionally, add any other Next.js config below
};

const withMdx = withMDX({
  extension: /\.mdx?$/,
  options: {
    // Optionally provide remark and rehype plugins
    remarkPlugins: [],
    rehypePlugins: [],
    // If you use a custom MDX provider, pass it here.
    // component: './components/mdx-provider.tsx',
  },
});

export default withMdx(nextConfig);
