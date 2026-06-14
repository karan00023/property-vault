# PropertyVault ERD

This ERD is the approved Milestone 1 migration contract. Authentication support tables used internally by Auth.js are omitted for clarity; the domain `users` table remains canonical for roles and MFA state.

```mermaid
erDiagram
  MARKETS ||--o{ NEIGHBORHOODS : contains
  MARKETS ||--o{ BUILDINGS : covers
  NEIGHBORHOODS ||--o{ BUILDINGS : locates
  BUILDINGS ||--o{ BUILDING_LINKS : has
  BUILDINGS ||--o{ UNIT_MIX : offers
  BUILDINGS ||--o{ FLOOR_PLANS : has
  BUILDINGS ||--o{ ASSETS : owns
  BUILDINGS ||--o{ BUILDING_AMENITIES : tagged
  AMENITIES ||--o{ BUILDING_AMENITIES : classifies
  BUILDINGS ||--o{ FIELD_PROVENANCE : traces
  SOURCES ||--o{ FIELD_PROVENANCE : supports
  SOURCES ||--o{ UNIT_MIX : supports
  SOURCES ||--o{ FLOOR_PLANS : supports
  EXTRACTION_JOBS ||--o{ SOURCES : captures
  EXTRACTION_JOBS ||--o{ REVIEW_ITEMS : stages
  BUILDINGS ||--o{ REVIEW_ITEMS : reviews
  USERS ||--o{ REVIEW_ITEMS : assigned
  BUILDINGS ||--o{ SOURCING_TASKS : needs
  USERS ||--o{ SOURCING_TASKS : assigned
  USERS ||--o{ AUDIT_LOG : acts
  SUBMISSIONS ||--o| EXTRACTION_JOBS : creates
  USERS ||--o{ MFA_CREDENTIALS : secures
  USERS ||--o{ RECOVERY_CODES : recovers

  MARKETS {
    uuid id PK
    text slug UK
    text name
    geography boundary
    boolean active
  }
  NEIGHBORHOODS {
    uuid id PK
    uuid market_id FK
    text slug
    text name
    geography boundary
  }
  BUILDINGS {
    uuid id PK
    uuid market_id FK
    uuid neighborhood_id FK
    text slug UK
    text status
    text name
    text_array aka_names
    text address_line1
    text city
    text region
    text postal_code
    geography geom
    text bbl
    text bin
    integer year_built
    integer floors
    integer total_units
    text developer
    text property_manager
    text leasing_platform
    text pet_policy
    text fee_policy
    timestamp verified_at
  }
  BUILDING_LINKS {
    uuid id PK
    uuid building_id FK
    text kind
    text url
    text verification_status
    integer http_status
    timestamp last_checked_at
  }
  SOURCES {
    uuid id PK
    uuid extraction_job_id FK
    text url
    timestamp fetched_at
    text snapshot_key
    text content_hash
  }
  FIELD_PROVENANCE {
    uuid id PK
    uuid building_id FK
    uuid source_id FK
    text field_path
    jsonb value
    numeric confidence
    uuid reviewed_by FK
    timestamp reviewed_at
  }
  UNIT_MIX {
    uuid id PK
    uuid building_id FK
    uuid source_id FK
    numeric bed_count
    numeric bath_count
    integer unit_count
    integer rent_min
    integer rent_max
    integer sqft_min
    integer sqft_max
    date as_of_date
    numeric confidence
  }
  FLOOR_PLANS {
    uuid id PK
    uuid building_id FK
    uuid source_id FK
    uuid asset_id FK
    text label
    numeric beds
    numeric baths
    integer sqft
    text type
    text embed_url
    text license_basis
  }
  ASSETS {
    uuid id PK
    uuid building_id FK
    text kind
    text storage_key
    text source_url
    text license_basis
    text status
    text perceptual_hash
  }
  AMENITIES {
    uuid id PK
    text slug UK
    text label
  }
  BUILDING_AMENITIES {
    uuid building_id FK
    uuid amenity_id FK
  }
  EXTRACTION_JOBS {
    uuid id PK
    text submitted_url
    text stage
    text status
    jsonb errors
    jsonb timings
    integer cost_micros
    timestamp next_attempt_at
  }
  REVIEW_ITEMS {
    uuid id PK
    uuid extraction_job_id FK
    uuid building_id FK
    uuid assignee_id FK
    text type
    text status
    jsonb payload_diff
    jsonb decisions
  }
  SOURCING_TASKS {
    uuid id PK
    uuid building_id FK
    uuid assignee_id FK
    text kind
    text status
    text_array urls_checked
    text notes
  }
  SUBMISSIONS {
    uuid id PK
    text submitted_url
    text optional_name
    text optional_address
    text contact_email
    text status
  }
  USERS {
    uuid id PK
    text email UK
    text role
    text status
    timestamp mfa_verified_at
  }
  MFA_CREDENTIALS {
    uuid id PK
    uuid user_id FK
    text encrypted_secret
    timestamp enabled_at
  }
  RECOVERY_CODES {
    uuid id PK
    uuid user_id FK
    text code_hash
    timestamp used_at
  }
  AUDIT_LOG {
    uuid id PK
    uuid actor_id FK
    text action
    text entity_type
    uuid entity_id
    jsonb before
    jsonb after
    timestamp created_at
  }
```
