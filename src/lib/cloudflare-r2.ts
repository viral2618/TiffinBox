import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// Initialize Cloudflare R2 client
const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME!
const PUBLIC_URL_BASE = process.env.CLOUDFLARE_R2_PUBLIC_URL!

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export async function uploadImageToR2(
  file: File,
  folder: string = 'prayer-stations'
): Promise<UploadResult> {
  try {
    console.log('Uploading file:', file.name, file.type, file.size);
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'File size too large. Maximum size is 5MB.'
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const fileName = `${timestamp}-${randomString}.${fileExtension}`
    const key = `${folder}/${fileName}`

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    console.log('Uploading to R2:', key, file.type, buffer.length);
    
    // Upload to R2
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      ContentLength: file.size,
      Metadata: {
        'original-name': file.name,
        'upload-timestamp': timestamp.toString(),
      },
    })

    await r2Client.send(command)
    console.log('Upload successful');

    // Generate public URL
    const publicUrl = `${PUBLIC_URL_BASE}/${key}`

    return {
      success: true,
      url: publicUrl,
      key: key
    }

  } catch (error) {
    console.error('R2 upload error:', error)
    return {
      success: false,
      error: 'Failed to upload image. Please try again.'
    }
  }
}

export async function deleteImageFromR2(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })

    await r2Client.send(command)
    return true
  } catch (error) {
    console.error('R2 delete error:', error)
    return false
  }
}

export async function getPresignedUploadUrl(
  fileName: string,
  fileType: string,
  folder: string = 'prayer-stations'
): Promise<{ success: boolean; uploadUrl?: string; key?: string; publicUrl?: string; error?: string }> {
  try {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(fileType)) {
      return {
        success: false,
        error: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = fileName.split('.').pop()?.toLowerCase()
    const uniqueFileName = `${timestamp}-${randomString}.${fileExtension}`
    const key = `${folder}/${uniqueFileName}`

    // Create presigned URL for upload
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: fileType,
      Metadata: {
        'original-name': fileName,
        'upload-timestamp': timestamp.toString(),
      },
    })

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 }) // 1 hour

    // Generate public URL
    const publicUrl = `${PUBLIC_URL_BASE}/${key}`

    return {
      success: true,
      uploadUrl,
      key,
      publicUrl
    }

  } catch (error) {
    console.error('Presigned URL generation error:', error)
    return {
      success: false,
      error: 'Failed to generate upload URL. Please try again.'
    }
  }
}

// Helper function to extract key from public URL
export function extractKeyFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    // Remove leading slash and return the key
    return pathname.startsWith('/') ? pathname.substring(1) : pathname
  } catch {
    return null
  }
}

// Helper function to validate if URL is from our R2 bucket
export function isValidR2Url(url: string): boolean {
  try {
    return url.startsWith(PUBLIC_URL_BASE)
  } catch (error) {
    return false
  }
}
