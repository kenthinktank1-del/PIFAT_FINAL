export const DEVICE_CATEGORIES = [
  { id: 'mobile', label: '📱 Mobile Phones', icon: 'Smartphone' },
  { id: 'router', label: '📟 Routers & Networking', icon: 'Router' },
  { id: 'storage', label: '💽 Hard Drives / Storage', icon: 'HardDrive' },
  { id: 'wearable', label: '⌚ Smart Watches & Wearables', icon: 'Watch' },
  { id: 'camera', label: '🎥 IP Cameras & CCTV', icon: 'Camera' },
  { id: 'smart-home', label: '💡 Smart Home Devices', icon: 'Lightbulb' },
  { id: 'speaker', label: '🔊 Smart Speakers', icon: 'Speaker' },
  { id: 'access-control', label: '🔐 Access Control', icon: 'Lock' },
  { id: 'sensor', label: '📡 IoT Sensors', icon: 'Radio' },
] as const;

export const CASE_STATUSES = [
  { value: 'open', label: 'Open', color: 'bg-blue-100 text-blue-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'closed', label: 'Closed', color: 'bg-green-100 text-green-800' },
  { value: 'archived', label: 'Archived', color: 'bg-gray-100 text-gray-800' },
] as const;

export const USER_ROLES = [
  { value: 'admin', label: 'Administrator' },
  { value: 'analyst', label: 'Analyst' },
  { value: 'field_officer', label: 'Field Officer' },
  { value: 'reviewer', label: 'Reviewer' },
] as const;

export const AI_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'analyzing', label: 'Analyzing', color: 'bg-blue-100 text-blue-800' },
  { value: 'complete', label: 'Complete', color: 'bg-green-100 text-green-800' },
  { value: 'failed', label: 'Failed', color: 'bg-red-100 text-red-800' },
] as const;

export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'bg-gray-100 text-gray-800' },
  { value: 'in_progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
] as const;
