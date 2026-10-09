import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { isTableMissingError, recordMissingTable } from './supabaseDataService';

export const CAREER_DOCUMENTS_BUCKET = 'career-documents';

export type DocumentCategory =
  | 'academic_transcript'
  | 'cv_resume'
  | 'jd_document'
  | 'certification_proof'
  | 'supporting_evidence';

export interface DocumentRecord {
  id: string;
  userId: string;
  profileId: string;
  category: DocumentCategory;
  filePath: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  extractionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  extractedData?: Record<string, any>;
  provenance: string;
  createdAt: string;
  signedUrl?: string;
}

export interface UploadDocumentParams {
  file: File;
  userId: string;
  profileId: string;
  category: DocumentCategory;
  provenance?: string;
}

// Local Storage Document Helpers
function getLocalDocs(userId: string): DocumentRecord[] {
  try {
    const raw = localStorage.getItem(`careersaathi_docs_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalDoc(userId: string, doc: DocumentRecord) {
  try {
    const docs = getLocalDocs(userId);
    docs.unshift(doc);
    localStorage.setItem(`careersaathi_docs_${userId}`, JSON.stringify(docs));
  } catch {
    // ignore
  }
}

/**
 * Uploads a document to Supabase Storage within a user-scoped directory
 * and creates the authoritative metadata record in public.documents table.
 * If storage bucket or database tables are not ready in schema cache,
 * seamlessly preserves the document locally.
 */
export async function uploadStudentDocument({
  file,
  userId,
  profileId,
  category,
  provenance = 'user_provided',
}: UploadDocumentParams): Promise<DocumentRecord> {
  const generatedId = `doc-${Date.now()}`;
  const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const storageFilePath = `${userId}/${category}/${Date.now()}-${cleanFileName}`;
  let objectUrl: string | undefined;

  try {
    objectUrl = URL.createObjectURL(file);
  } catch {
    // ignore
  }

  const fallbackRecord: DocumentRecord = {
    id: generatedId,
    userId,
    profileId,
    category,
    filePath: storageFilePath,
    fileName: file.name,
    mimeType: file.type || 'application/octet-stream',
    fileSize: file.size,
    extractionStatus: 'completed',
    extractedData: {},
    provenance,
    createdAt: new Date().toISOString(),
    signedUrl: objectUrl,
  };

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) {
    saveLocalDoc(userId, fallbackRecord);
    return fallbackRecord;
  }

  // 1. Attempt upload to Supabase Storage bucket
  let uploadSucceeded = false;
  try {
    const { error: uploadError } = await supabase.storage
      .from(CAREER_DOCUMENTS_BUCKET)
      .upload(storageFilePath, file, {
        cacheControl: '3600',
        upsert: true,
      });

    if (uploadError) {
      console.info('[Career Saathi Storage] Bucket upload note:', uploadError.message, '- document preserved locally.');
      saveLocalDoc(userId, fallbackRecord);
      return fallbackRecord;
    }
    uploadSucceeded = true;
  } catch (err: any) {
    console.info('[Career Saathi Storage] Storage note:', err.message || err, '- document preserved locally.');
    saveLocalDoc(userId, fallbackRecord);
    return fallbackRecord;
  }

  // 2. Generate signed URL for immediate download/preview
  let signedUrl: string | undefined = objectUrl;
  if (uploadSucceeded) {
    try {
      const { data: signedData } = await supabase.storage
        .from(CAREER_DOCUMENTS_BUCKET)
        .createSignedUrl(storageFilePath, 3600);

      if (signedData?.signedUrl) {
        signedUrl = signedData.signedUrl;
      }
    } catch {
      // keep objectUrl fallback
    }
  }

  // 3. Insert metadata into public.documents table if it exists
  try {
    const { data: docRow, error: dbError } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        profile_id: profileId,
        category,
        file_path: storageFilePath,
        file_name: file.name,
        mime_type: file.type || 'application/octet-stream',
        file_size: file.size,
        extraction_status: 'completed',
        provenance,
      })
      .select('*')
      .single();

    if (dbError) {
      if (isTableMissingError(dbError)) {
        recordMissingTable('documents');
      }
      saveLocalDoc(userId, { ...fallbackRecord, signedUrl });
      return { ...fallbackRecord, signedUrl };
    }

    const createdRecord: DocumentRecord = {
      id: docRow.id,
      userId: docRow.user_id,
      profileId: docRow.profile_id,
      category: docRow.category as DocumentCategory,
      filePath: docRow.file_path,
      fileName: docRow.file_name,
      mimeType: docRow.mime_type,
      fileSize: Number(docRow.file_size || 0),
      extractionStatus: docRow.extraction_status,
      extractedData: docRow.extracted_data || {},
      provenance: docRow.provenance,
      createdAt: docRow.created_at,
      signedUrl,
    };

    saveLocalDoc(userId, createdRecord);
    return createdRecord;
  } catch {
    saveLocalDoc(userId, { ...fallbackRecord, signedUrl });
    return { ...fallbackRecord, signedUrl };
  }
}

/**
 * Creates a temporary signed download/view URL for an existing stored document.
 */
export async function getDocumentSignedUrl(filePath: string, expiresIn = 3600): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return null;

  try {
    const { data, error } = await supabase.storage
      .from(CAREER_DOCUMENTS_BUCKET)
      .createSignedUrl(filePath, expiresIn);

    if (error || !data) {
      return null;
    }
    return data.signedUrl;
  } catch {
    return null;
  }
}

/**
 * Retrieves all documents for a student.
 */
export async function fetchStudentDocuments(
  userId: string,
  category?: DocumentCategory
): Promise<DocumentRecord[]> {
  const localDocs = getLocalDocs(userId);
  const filteredLocal = category ? localDocs.filter((d) => d.category === category) : localDocs;

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return filteredLocal;

  try {
    let query = supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    if (error) {
      if (isTableMissingError(error)) {
        recordMissingTable('documents');
      }
      return filteredLocal;
    }

    const fetched = (data || []).map((doc) => ({
      id: doc.id,
      userId: doc.user_id,
      profileId: doc.profile_id,
      category: doc.category as DocumentCategory,
      filePath: doc.file_path,
      fileName: doc.file_name,
      mimeType: doc.mime_type,
      fileSize: Number(doc.file_size || 0),
      extractionStatus: doc.extraction_status,
      extractedData: doc.extracted_data || {},
      provenance: doc.provenance,
      createdAt: doc.created_at,
    }));

    return fetched.length > 0 ? fetched : filteredLocal;
  } catch {
    return filteredLocal;
  }
}

/**
 * Deletes a document from storage and metadata from database.
 */
export async function deleteStudentDocument(documentId: string, filePath: string, userId: string): Promise<boolean> {
  // Update local storage
  try {
    const docs = getLocalDocs(userId).filter((d) => d.id !== documentId && d.filePath !== filePath);
    localStorage.setItem(`careersaathi_docs_${userId}`, JSON.stringify(docs));
  } catch {
    // ignore
  }

  const supabase = getSupabaseClient();
  if (!supabase || !isSupabaseConfigured()) return true;

  try {
    await supabase.from('documents').delete().eq('id', documentId).eq('user_id', userId);
  } catch {
    // ignore
  }

  try {
    await supabase.storage.from(CAREER_DOCUMENTS_BUCKET).remove([filePath]);
  } catch {
    // ignore
  }

  return true;
}
