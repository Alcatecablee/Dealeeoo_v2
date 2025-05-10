import React from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
// @ts-ignore
import manual from '../../public/admin-manual.md';
import ReactMarkdown from 'react-markdown';

const AdminManual: React.FC = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="container mx-auto px-4 py-10 max-w-3xl">
      <Card className="p-8">
        <ReactMarkdown className="prose dark:prose-invert max-w-none">{manual}</ReactMarkdown>
      </Card>
    </main>
  </div>
);

export default AdminManual; 