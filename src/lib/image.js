// Downscales a screenshot before upload so the backend can forward it to the
// vision model without a resize step. ~1568px on the long edge is the sweet
// spot for vision token cost vs. legibility.
export default async function downscaleImage(file, maxEdge = 1568, quality = 0.8) {
  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxEdge / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process image'))),
      'image/jpeg',
      quality,
    )
  })
}
