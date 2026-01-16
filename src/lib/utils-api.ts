// Helper untuk extract data dari berbagai format response API
export function extractData<T>(response: any): T {
  // Jika response adalah array, return langsung
  if (Array.isArray(response)) return response as T
  
  // Jika ada response.data.data (paginated response)
  if (response?.data?.data) return response.data.data as T
  
  // Jika ada response.data (wrapped response)
  if (response?.data) return response.data as T
  
  // Return response langsung atau empty array
  return (response || []) as T
}
