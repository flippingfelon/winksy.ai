# Lash Feed Storage Setup

## Create Supabase Storage Bucket for Feed Images

To enable image uploads for the Lash Feed, you need to create a storage bucket in Supabase.

### Steps:

1. **Go to Supabase Dashboard**
   - Open your project at: https://supabase.com/dashboard/project/YOUR_PROJECT_ID

2. **Navigate to Storage**
   - Click on "Storage" in the left sidebar
   - Click on "Buckets" tab

3. **Create New Bucket**
   - Click the **"New Bucket"** button
   - Bucket name: `feed-images`
   - **✅ Enable "Public bucket"** (IMPORTANT!)
   - Click **"Create bucket"**

4. **Verify Bucket Settings**
   - Click on the `feed-images` bucket
   - Go to "Settings" tab
   - Ensure "Public" is enabled
   - File size limit: 10MB (recommended)

5. **Set Up Storage Policies (if needed)**
   
   If you need custom policies, go to Storage > Policies and add:

   ```sql
   -- Allow authenticated users to upload
   CREATE POLICY "Allow authenticated uploads"
   ON storage.objects FOR INSERT
   TO authenticated
   WITH CHECK (bucket_id = 'feed-images');

   -- Allow public read access
   CREATE POLICY "Allow public read"
   ON storage.objects FOR SELECT
   TO public
   USING (bucket_id = 'feed-images');

   -- Allow users to delete their own uploads
   CREATE POLICY "Allow users to delete own files"
   ON storage.objects FOR DELETE
   TO authenticated
   USING (bucket_id = 'feed-images' AND auth.uid()::text = (storage.foldername(name))[1]);
   ```

6. **Test the Setup**
   - Try creating a post in the Lash Feed
   - Upload an image
   - Check the browser console for any errors

---

## Troubleshooting

### Error: "Bucket not found"
- Make sure you created the bucket named exactly: `feed-images`
- Check that the bucket is public
- Refresh the Supabase dashboard

### Error: "Permission denied"
- Verify RLS policies on the `posts` table allow inserts
- Check that storage policies allow uploads

### Error: "File too large"
- Maximum file size is 10MB
- Consider compressing images before upload

---

## Storage URL Format

After upload, images will be accessible at:
```
https://YOUR_PROJECT_ID.supabase.co/storage/v1/object/public/feed-images/posts/FILENAME
```

---

## Current Status

- ✅ Create post page exists at `/feed/create`
- ✅ Image upload UI implemented
- ✅ Post submission logic implemented
- ⏳ **Storage bucket needs to be created** ← YOU ARE HERE
- ✅ Error handling and debugging added
- ✅ Console logging for troubleshooting

---

## Next Steps

1. Create the `feed-images` bucket in Supabase (follow steps above)
2. Try creating a test post
3. Check browser console (F12 or Cmd+Option+I) for detailed logs
4. If you see any errors, check the console output - it will guide you!

