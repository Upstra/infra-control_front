# Group Shutdown Feature - Frontend Integration Guide

## Overview
This feature allows users to preview and execute a controlled shutdown sequence for groups of servers and VMs. The shutdown follows a priority-based order, shutting down VMs before servers.

## API Endpoints

### 1. Preview Shutdown Sequence
**Endpoint:** `POST /group/shutdown/preview`  
**Authentication:** Required (JWT Bearer token)  
**Purpose:** Preview the shutdown order without executing it

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Request Body:**
```typescript
interface ShutdownRequestDto {
  groupIds: string[]; // Array of group IDs (can be server groups or VM groups)
}
```

**Response:**
```typescript
interface ShutdownPreviewListResponseDto {
  items: ShutdownStep[];    // Paginated shutdown steps
  totalItems: number;       // Total number of shutdown steps
  totalPages: number;       // Total number of pages
  currentPage: number;      // Current page number
  totalVms: number;         // Total VMs across all pages
  totalServers: number;     // Total servers across all pages
}

interface ShutdownStep {
  order: number;          // Shutdown order (1, 2, 3...)
  type: 'vm' | 'server';  // Entity type
  entityId: string;       // ID of the VM or server
  entityName: string;     // Display name
  groupId: string;        // Group ID this entity belongs to
  groupName: string;      // Group display name
  priority: number;       // Group priority (higher = shutdown first)
}
```

**Example Request:**
```
POST /group/shutdown/preview?page=1&limit=10
Content-Type: application/json

{
  "groupIds": ["group-server-1", "group-vm-1", "group-server-2"]
}
```

**Example Response:**
```json
{
  "items": [
    {
      "order": 1,
      "type": "vm",
      "entityId": "vm-123",
      "entityName": "Web Server VM 1",
      "groupId": "group-vm-1",
      "groupName": "Production VMs",
      "priority": 10
    },
    {
      "order": 2,
      "type": "vm",
      "entityId": "vm-124",
      "entityName": "Database VM",
      "groupId": "group-vm-1",
      "groupName": "Production VMs",
      "priority": 10
    },
    {
      "order": 3,
      "type": "server",
      "entityId": "server-456",
      "entityName": "Physical Server 1",
      "groupId": "group-server-1",
      "groupName": "Production Servers",
      "priority": 5
    }
  ],
  "totalItems": 25,
  "totalPages": 3,
  "currentPage": 1,
  "totalVms": 15,
  "totalServers": 10
}
```

### 2. Execute Shutdown
**Endpoint:** `POST /group/shutdown/execute`  
**Authentication:** Required (JWT Bearer token + Admin role)  
**Purpose:** Execute the actual shutdown sequence

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Request Body:** Same as preview
```typescript
interface ShutdownRequestDto {
  groupIds: string[];
}
```

**Response:** Same as preview (returns the executed shutdown sequence with pagination)

**Note:** This endpoint requires admin privileges. Non-admin users will receive a 403 Forbidden error.

### 3. Get Server Groups
**Endpoint:** `GET /group/server`  
**Authentication:** Required (JWT Bearer token)  
**Purpose:** Get paginated list of server groups

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `roomId` (optional): Filter by room ID
- `priority` (optional): Filter by priority level

**Response:**
```typescript
interface GroupServerListResponseDto {
  items: GroupServerResponseDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface GroupServerResponseDto {
  id: string;
  name: string;
  priority: number;
  description?: string;
  cascade: boolean;
  roomId?: string;
  serverIds: string[];
  vmGroupIds: string[];
}
```

### 4. Get VM Groups  
**Endpoint:** `GET /group/vm`  
**Authentication:** Required (JWT Bearer token)  
**Purpose:** Get paginated list of VM groups

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:**
```typescript
interface GroupVmListResponseDto {
  items: GroupVmResponseDto[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

interface GroupVmResponseDto {
  id: string;
  name: string;
  priority: number;
  description?: string;
  cascade: boolean;
  roomId?: string;
  serverGroupId: string;
  vmIds: string[];
}
```

## Frontend Implementation Requirements

### 1. UI Components Needed

#### Shutdown Preview Dialog
- Display a paginated table/list showing the shutdown sequence
- Columns: Order, Type (with icon), Name, Group, Priority
- Pagination controls (Previous/Next, page numbers, items per page selector)
- Summary showing total VMs and servers across all pages
- Current page info (showing X-Y of Z items)
- Warning message about the operation
- Confirm and Cancel buttons

#### Group Selection
- Multi-select component for choosing groups
- Should support both server groups and VM groups
- Display group type, name, and entity count
- Paginated lists with search/filter capabilities
- Support for filtering by room, priority, etc.

### 2. User Flow

1. **Group Selection**
   - User loads paginated list of server groups (`GET /group/server`)
   - User loads paginated list of VM groups (`GET /group/vm`)
   - User can filter groups by room, priority, etc.
   - User selects one or more groups from the lists
   - Can mix server groups and VM groups

2. **Preview**
   - User clicks "Preview Shutdown"
   - System calls preview endpoint
   - Display shutdown sequence in order
   - Show total impact (X VMs, Y servers)

3. **Confirmation**
   - User reviews the paginated sequence
   - Can navigate through pages to see full shutdown plan
   - Must confirm they understand the impact
   - Only admins see the "Execute" button

4. **Execution**
   - Admin clicks "Execute Shutdown"
   - System calls execute endpoint with pagination
   - Show progress/completion status
   - Log the action in history

### 3. Error Handling

```typescript
// 404 - Groups not found
{
  "message": "Groups not found: group-123, group-456",
  "error": "Not Found",
  "statusCode": 404
}

// 403 - Forbidden (non-admin trying to execute)
{
  "message": "Forbidden resource",
  "error": "Forbidden",
  "statusCode": 403
}

// 401 - Unauthorized (no token)
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

### 4. TypeScript Types for Frontend

```typescript
// API Service
interface GroupShutdownService {
  // Group management
  getServerGroups(page?: number, limit?: number, filters?: {roomId?: string, priority?: number}): Promise<GroupServerListResponseDto>;
  getVmGroups(page?: number, limit?: number): Promise<GroupVmListResponseDto>;
  
  // Shutdown operations
  previewShutdown(groupIds: string[], page?: number, limit?: number): Promise<ShutdownPreviewListResponseDto>;
  executeShutdown(groupIds: string[], page?: number, limit?: number): Promise<ShutdownPreviewListResponseDto>;
}

// Store/State Management
interface ShutdownState {
  // Group data
  serverGroups: GroupServerListResponseDto | null;
  vmGroups: GroupVmListResponseDto | null;
  selectedGroupIds: string[];
  
  // Shutdown data
  previewData: ShutdownPreviewListResponseDto | null;
  currentPage: number;
  pageSize: number;
  
  // UI state
  isLoading: boolean;
  error: string | null;
}

// Component Props
interface ShutdownPreviewProps {
  data: ShutdownPreviewListResponseDto;
  currentPage: number;
  onPageChange: (page: number) => void;
  onConfirm: () => void;
  onCancel: () => void;
  isAdmin: boolean;
}
```

### 5. Important Business Rules

1. **Shutdown Order:**
   - VMs are always shut down before servers
   - Within each type, groups with higher priority shut down first
   - Within a group, entities maintain their order

2. **Cascade Property:**
   - Only groups with `cascade: true` will be included
   - This is handled server-side, frontend doesn't need to filter

3. **Permissions:**
   - Any authenticated user can preview
   - Only admins can execute
   - Frontend should hide/disable execute button for non-admins

### 6. API Integration Example

```typescript
// Vue 3 Composition API Example
import { ref } from 'vue';
import { useApi } from '@/composables/useApi';

export function useGroupShutdown() {
  const api = useApi();
  const serverGroups = ref<GroupServerListResponseDto | null>(null);
  const vmGroups = ref<GroupVmListResponseDto | null>(null);
  const previewData = ref<ShutdownPreviewListResponseDto | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const loadServerGroups = async (page = 1, limit = 10, filters?: {roomId?: string, priority?: number}) => {
    loading.value = true;
    error.value = null;
    
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
      if (filters?.roomId) params.append('roomId', filters.roomId);
      if (filters?.priority) params.append('priority', filters.priority.toString());
      
      const response = await api.get(`/group/server?${params}`);
      serverGroups.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load server groups';
    } finally {
      loading.value = false;
    }
  };

  const loadVmGroups = async (page = 1, limit = 10) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.get(`/group/vm?page=${page}&limit=${limit}`);
      vmGroups.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to load VM groups';
    } finally {
      loading.value = false;
    }
  };

  const previewShutdown = async (groupIds: string[], page = 1, limit = 10) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.post(`/group/shutdown/preview?page=${page}&limit=${limit}`, {
        groupIds
      });
      previewData.value = response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to preview shutdown';
    } finally {
      loading.value = false;
    }
  };

  const executeShutdown = async (groupIds: string[], page = 1, limit = 10) => {
    loading.value = true;
    error.value = null;
    
    try {
      const response = await api.post(`/group/shutdown/execute?page=${page}&limit=${limit}`, {
        groupIds
      });
      return response.data;
    } catch (err) {
      error.value = err.response?.data?.message || 'Failed to execute shutdown';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    // Data
    serverGroups,
    vmGroups,
    previewData,
    loading,
    error,
    
    // Methods
    loadServerGroups,
    loadVmGroups,
    previewShutdown,
    executeShutdown
  };
}
```

### 7. UI/UX Recommendations

1. **Visual Hierarchy:**
   - Use different icons/colors for VMs vs Servers
   - Highlight high-priority groups
   - Number the shutdown order clearly

2. **Safety Features:**
   - Require confirmation checkbox
   - Show countdown or type confirmation
   - Display affected services/applications

3. **Progress Indication:**
   - During preview: loading spinner
   - During execution: progress bar with current step
   - Show completed vs pending items

4. **Responsive Design:**
   - Mobile: vertical list with collapsible groups
   - Desktop: table with sortable columns
   - Print-friendly view for documentation

## Testing Checklist

### Group Loading
- [ ] Server groups load with pagination
- [ ] VM groups load with pagination  
- [ ] Filters work correctly (room, priority)
- [ ] Pagination controls work for group lists
- [ ] Empty states display when no groups found

### Group Selection
- [ ] Can select multiple groups across pages
- [ ] Can mix server groups and VM groups
- [ ] Selected groups persist across page navigation
- [ ] Group selection UI shows selected state

### Shutdown Preview
- [ ] Preview shows correct shutdown order
- [ ] VMs appear before servers
- [ ] Priority ordering is correct
- [ ] Total counts are accurate across all pages
- [ ] Pagination works in preview dialog

### Permissions & Execution
- [ ] Non-admin users cannot see execute button
- [ ] Admin users can execute shutdown
- [ ] Execute returns paginated results

### Error Handling & UI
- [ ] Error messages display correctly
- [ ] Loading states work properly
- [ ] Empty state when no groups selected
- [ ] Network errors handled gracefully