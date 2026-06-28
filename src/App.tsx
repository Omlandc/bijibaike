import { Routes, Route, Navigate } from 'react-router';
import { SiteLayout } from '@/components/SiteLayout';
import Home from '@/pages/Home';
import BlogList from '@/pages/BlogList';
import Post from '@/pages/Post';
import { TagsIndex, TagDetail } from '@/pages/Tags';
import Graph from '@/pages/Graph';
import About from '@/pages/About';
import Privacy from '@/pages/Privacy';
import Contact from '@/pages/Contact';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/blog" element={<BlogList />} />
        <Route path="/blog/:slug" element={<Post />} />
        <Route path="/tags" element={<TagsIndex />} />
        <Route path="/tags/:tag" element={<TagDetail />} />
        <Route path="/graph" element={<Graph />} />
        <Route path="/about" element={<About />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}