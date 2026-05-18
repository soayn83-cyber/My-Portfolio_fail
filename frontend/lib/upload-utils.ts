const DEFAULT_MAX_DATA_URL_FILE_SIZE = 5 * 1024 * 1024

export function readFileAsDataUrl(file: File, maxBytes = DEFAULT_MAX_DATA_URL_FILE_SIZE) {
  if (file.size > maxBytes) {
    throw new Error(`업로드 파일 ${file.name}의 크기가 5MB를 초과합니다.`)
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "")
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}