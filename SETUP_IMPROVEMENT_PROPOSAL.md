# Setup Wizard Improvement Proposal

## Current Setup Flow Analysis

### How it Works Today

The current setup wizard follows a linear, single-resource approach:

1. **Welcome** → 2. **Create 1 Room** → 3. **Create 1 UPS** → 4. **Create 1 Server** → 5. **Complete**

#### Limitations
- Only creates **one** of each resource type
- Linear flow without flexibility
- No bulk configuration options
- No import/export capabilities
- No templates or presets

### Current Architecture

```typescript
// Current step data structure
interface SetupStepData {
  room?: Room;
  ups?: UPS;
  server?: Server;
}

// Current flow: 1 resource per step
```

## Proposed Improvements

### 1. Multi-Resource Creation Approach

Transform the setup into a more flexible, multi-resource wizard:

```
Welcome → Configure Resources → Review & Apply → Complete
           ├── Rooms (0...N)
           ├── UPS (0...N)
           └── Servers (0...N)
```

### 2. Implementation Strategy

#### Frontend Changes

**A. New Setup Store Structure**
```typescript
interface ImprovedSetupData {
  rooms: Room[];
  upsList: UPS[];
  servers: Server[];
  templates: {
    roomTemplates: RoomTemplate[];
    serverTemplates: ServerTemplate[];
  };
  bulkImport?: {
    format: 'csv' | 'json';
    data: any;
  };
}
```

**B. Resource Management Components**
```vue
<!-- ResourceManager.vue -->
<template>
  <div class="resource-manager">
    <ResourceList 
      :items="resources" 
      @add="openAddDialog"
      @edit="openEditDialog"
      @delete="removeResource"
      @duplicate="duplicateResource"
    />
    <BulkActions
      @import="handleImport"
      @export="handleExport"
      @applyTemplate="applyTemplate"
    />
  </div>
</template>
```

**C. Setup Flow Redesign**
```typescript
export enum SetupSteps {
  WELCOME = 'welcome',
  RESOURCE_PLANNING = 'planning',      // New: Overview & strategy
  ROOMS_CONFIG = 'rooms',              // Configure all rooms
  UPS_CONFIG = 'ups',                  // Configure all UPS
  SERVERS_CONFIG = 'servers',          // Configure all servers
  RELATIONSHIPS = 'relationships',     // New: Map servers to rooms/UPS
  REVIEW = 'review',                   // New: Review all configurations
  COMPLETE = 'complete'
}
```

### 3. Feature Additions

#### A. Bulk Operations
```typescript
// Bulk import example
interface BulkImportData {
  rooms: Array<{
    name: string;
    location: string;
    capacity: number;
    coolingType: string;
  }>;
  servers: Array<{
    name: string;
    ip: string;
    roomName: string;  // Reference by name
    upsName?: string;  // Optional UPS reference
    // ... other fields
  }>;
}
```

#### B. Templates & Presets
```typescript
interface SetupTemplate {
  name: string;
  description: string;
  configuration: {
    roomDefaults?: Partial<Room>;
    serverDefaults?: Partial<Server>;
    upsDefaults?: Partial<UPS>;
    quickSetups: Array<{
      name: string;
      rooms: number;
      serversPerRoom: number;
      upsPerRoom: number;
    }>;
  };
}

// Predefined templates
const templates = [
  {
    name: 'Small Business',
    quickSetups: [{
      name: 'Basic Setup',
      rooms: 1,
      serversPerRoom: 5,
      upsPerRoom: 1
    }]
  },
  {
    name: 'Enterprise',
    quickSetups: [{
      name: 'Multi-Site Setup',
      rooms: 3,
      serversPerRoom: 20,
      upsPerRoom: 2
    }]
  }
];
```

#### C. Visual Resource Builder
```vue
<!-- VisualRoomBuilder.vue -->
<template>
  <div class="visual-builder">
    <RoomGrid :rooms="rooms">
      <template #room="{ room }">
        <DraggableServer 
          v-for="server in getServersInRoom(room.id)"
          :key="server.id"
          @drop="assignToRoom"
        />
      </template>
    </RoomGrid>
  </div>
</template>
```

### 4. Backend Requirements

#### API Endpoints Needed

```typescript
// Bulk creation endpoints
POST /api/setup/bulk
{
  rooms: Room[],
  upsList: UPS[],
  servers: Server[]
}

// Template management
GET  /api/setup/templates
POST /api/setup/templates
GET  /api/setup/templates/:id

// Validation endpoint
POST /api/setup/validate
{
  configuration: SetupConfiguration
}

// Transaction support for atomicity
POST /api/setup/transaction/begin
POST /api/setup/transaction/commit
POST /api/setup/transaction/rollback
```

### 5. Implementation Phases

#### Phase 1: Frontend Multi-Resource Support
- Modify setup store to handle arrays
- Create resource list components
- Add/edit/delete functionality per resource type
- Keep existing single-resource flow as fallback

#### Phase 2: Backend Bulk Operations
- Implement bulk creation endpoints
- Add transaction support
- Create validation logic
- Error handling for partial failures

#### Phase 3: Advanced Features
- Import/export functionality
- Template system
- Visual builders
- Relationship mapping UI

### 6. Code Example: Multi-Resource Setup Store

```typescript
// stores/setup.store.ts
export const useSetupStore = defineStore('setup', () => {
  // Multi-resource state
  const resources = reactive({
    rooms: [] as Room[],
    upsList: [] as UPS[],
    servers: [] as Server[]
  });

  // Resource management
  const addRoom = (room: Partial<Room>) => {
    const newRoom = { ...room, id: generateTempId() };
    resources.rooms.push(newRoom as Room);
    return newRoom;
  };

  const updateRoom = (id: string, updates: Partial<Room>) => {
    const index = resources.rooms.findIndex(r => r.id === id);
    if (index >= 0) {
      resources.rooms[index] = { ...resources.rooms[index], ...updates };
    }
  };

  const removeRoom = (id: string) => {
    resources.rooms = resources.rooms.filter(r => r.id !== id);
    // Also remove dependent resources
    resources.servers = resources.servers.filter(s => s.roomId !== id);
  };

  // Bulk operations
  const importConfiguration = async (data: BulkImportData) => {
    // Validate import data
    const validation = await setupApi.validateBulkData(data);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Import rooms first
    data.rooms.forEach(room => addRoom(room));

    // Then UPS and servers with relationships
    // ...
  };

  const applyConfiguration = async () => {
    try {
      const result = await setupApi.bulkCreate({
        rooms: resources.rooms,
        upsList: resources.upsList,
        servers: resources.servers
      });
      
      // Update with real IDs from backend
      result.rooms.forEach((room, index) => {
        resources.rooms[index].id = room.id;
      });
      
      return result;
    } catch (error) {
      // Handle errors, possibly with rollback
      throw error;
    }
  };

  return {
    resources,
    addRoom,
    updateRoom,
    removeRoom,
    importConfiguration,
    applyConfiguration,
    // ... other methods
  };
});
```

### 7. UI/UX Improvements

#### A. Progress Indication
- Show resource count badges
- Visual preview of infrastructure
- Estimated completion time
- Save & resume capability

#### B. Validation & Feedback
- Real-time validation
- Resource dependency checks
- Capacity warnings
- Cost estimation (if applicable)

#### C. Quick Actions
- Duplicate resources
- Bulk edit properties
- Smart defaults
- Auto-naming patterns

### 8. Migration Strategy

1. **Backward Compatibility**: Keep existing single-resource flow
2. **Feature Flag**: Enable multi-resource mode via setting
3. **Progressive Enhancement**: Start with multi-room, then multi-server
4. **Data Migration**: Convert existing setups to new format

## Conclusion

### Frontend vs Backend Requirements

**Frontend Only:**
- ✅ Multi-resource forms and state management
- ✅ Import/export to JSON
- ✅ Templates (client-side)
- ✅ Visual builders
- ❌ Atomic creation (needs backend transactions)
- ❌ Bulk validation (needs backend support)

**Backend Required:**
- Bulk creation endpoints with transaction support
- Server-side validation for complex rules
- Template storage and sharing
- Performance optimization for large configurations
- Rollback capability for failed setups

### Recommendation

Start with **Phase 1** (frontend multi-resource support) as it provides immediate value with minimal backend changes. The existing single-resource endpoints can be called multiple times initially. Then progressively add backend optimizations for better performance and atomicity.

This approach allows users to configure their entire infrastructure during setup while maintaining the option for a simple, quick setup for smaller deployments.