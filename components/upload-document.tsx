'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { uploadDocument } from '@/app/actions/documents';

export function UploadDocument() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(event.currentTarget);
      await uploadDocument(formData);
      event.currentTarget.reset();
    } catch (error) {
      console.error('Error uploading document:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Input
          type="text"
          name="title"
          placeholder="Document Title"
          required
          className="w-full"
        />
      </div>
      <div>
        <Textarea
          name="content"
          placeholder="Document Content"
          required
          className="w-full min-h-[200px]"
        />
      </div>
      <div>
        <Input
          type="file"
          name="file"
          className="w-full"
        />
      </div>
      <Button type="submit" disabled={loading}>
        {loading ? 'Uploading...' : 'Upload Document'}
      </Button>
    </form>
  );
}
