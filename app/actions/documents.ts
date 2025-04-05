'use server';

import { db } from '@/db';
import { documents } from '@/db/schema';
import { currentUser } from '@clerk/nextjs/server';
import { eq } from 'drizzle-orm';

export async function uploadDocument(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  const title = formData.get('title') as string;
  const content = formData.get('content') as string;
  const file = formData.get('file') as File;

  if (!title || !content) {
    throw new Error('Missing required fields');
  }

  try {
    // Here you would typically upload the file to a storage service
    // and get back a URL. For now, we'll just store the content.
    
    const document = await db.insert(documents).values({
      userId: user.id,
      title,
      content,
      fileType: file ? file.type : null,
      fileUrl: null, // You would store the URL from your file storage service here
    });

    return { success: true, document };
  } catch (error) {
    console.error('Error uploading document:', error);
    throw new Error('Failed to upload document');
  }
}

export async function getUserDocuments() {
  const user = await currentUser();
  if (!user) throw new Error('Unauthorized');

  try {
    const userDocuments = await db
      .select()
      .from(documents)
      .where(eq(documents.userId, user.id));

    return userDocuments;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw new Error('Failed to fetch documents');
  }
}
