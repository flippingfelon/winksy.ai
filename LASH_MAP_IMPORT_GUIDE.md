# 📥 Lash Map Import System

## ✨ Overview

Comprehensive import system to bulk import lash maps from JSON file into your database. Perfect for populating your lash map library quickly!

---

## 🎯 Features

### **Import Page UI**
- Admin/tech only access at `/dashboard/tech/lash-maps/import`
- Preview maps before importing
- 3 import modes:
  - **Update Existing**: Update existing maps + create new ones
  - **Skip Duplicates**: Only create new maps, skip existing
  - **Create New Only**: Error on duplicates
- Real-time import progress and results
- Detailed summary with stats

### **Smart Import Logic**
- ✅ Reads perplexityresults.json
- ✅ Validates data structure
- ✅ Checks for existing maps by name
- ✅ Converts zones array to database format
- ✅ Normalizes categories (Classic → Natural)
- ✅ Creates proper specifications JSON
- ✅ Handles errors gracefully

### **CLI Script Option**
- Run via: `npm run import-lash-maps`
- Perfect for bulk imports during development
- Shows progress in terminal
- Colored output for easy reading

---

## 🚀 How to Use

### Method 1: Web UI (Recommended)

1. **Navigate to Import Page**
   ```
   /dashboard/tech/lash-maps/import
   ```

2. **Select Import Mode**
   - Choose how to handle existing maps

3. **Preview Maps**
   - Click "Preview Maps" to see what will be imported
   - Review the 40+ lash maps from JSON

4. **Run Import**
   - Click "Import X Maps"
   - Confirm the import
   - Wait for completion

5. **Review Results**
   - See counts: Created, Updated, Skipped, Errors
   - View detailed log of each map
   - Click "View All Lash Maps" to see imported maps

### Method 2: CLI Script

1. **Run the Script**
   ```bash
   npm run import-lash-maps
   ```

2. **Watch Progress**
   - See each map being processed
   - Real-time status updates
   - Summary at the end

---

## 📊 Data Mapping

### JSON Structure → Database

| JSON Field | Database Column | Notes |
|------------|----------------|--------|
| `name` | `name` | Direct mapping |
| `category` | `category` | "Classic" → "Natural" |
| `difficulty` | `difficulty` | Beginner/Intermediate/Pro |
| `description` | `description` | Direct mapping |
| `zones[]` | `specifications.zones` | Stored as JSONB |
| `products[]` | `specifications.recommended_products` | Array in JSONB |
| `application_notes` | `specifications.application_notes` | String in JSONB |

### Specifications JSON Format

```json
{
  "lengths": {
    "Inner": 8,
    "Inner-Mid": 9,
    "Center": 10,
    "Outer-Mid": 11,
    "Outer": 12
  },
  "curl_options": "C",
  "diameter": "0.15mm",
  "recommended_products": ["0.15mm Classic Lashes - C Curl", ...],
  "application_notes": "Maintain smooth graduation...",
  "zones": [
    {"zone": "Inner", "length": "8mm", "curl": "C", "diameter": "0.15mm"},
    ...
  ]
}
```

---

## 🎨 Import Modes Explained

### 1. **Update Existing** (Recommended)
- Checks if map exists by name
- **If exists**: Updates all fields with new data
- **If doesn't exist**: Creates new map
- **Use case**: Refreshing map library with latest data

### 2. **Skip Duplicates**
- Checks if map exists by name
- **If exists**: Skips without error
- **If doesn't exist**: Creates new map
- **Use case**: Adding new maps without touching existing ones

### 3. **Create New Only**
- Checks if map exists by name
- **If exists**: Throws error, doesn't create
- **If doesn't exist**: Creates new map
- **Use case**: Ensuring no accidental overwrites

---

## 📋 Import Results

### Summary Stats
- **Created**: New maps added to database
- **Updated**: Existing maps refreshed with new data
- **Skipped**: Existing maps left unchanged (skip mode)
- **Errors**: Failed imports with reasons

### Detailed Log
Each map shows:
- ✅ **Created**: Green badge, successfully added
- 🔄 **Updated**: Blue badge, successfully updated
- ⚠️ **Skipped**: Yellow badge, already exists
- ❌ **Error**: Red badge, with error message

---

## 🛠️ Technical Details

### API Endpoints

**Preview API**
```
GET /api/lash-maps/import/preview
```
- Returns: Array of maps from JSON
- Validates: Basic structure
- No database changes

**Import API**
```
POST /api/lash-maps/import
Body: { "mode": "update" | "skip" | "create-only" }
```
- Processes: All maps from JSON
- Returns: Detailed results object

### Error Handling

**File Errors**
- JSON file not found → Clear error message
- Invalid JSON format → Shows parse error
- Missing fields → Skips that map, continues

**Database Errors**
- Connection issues → Fails gracefully
- Duplicate key violations → Handled by mode
- Invalid data → Logged, continues with others

### Validation

**Required Fields**
- name (string)
- category (string)
- difficulty (string)
- description (string)

**Optional Fields**
- zones (array) - defaults to empty
- products (array) - defaults to empty
- application_notes (string) - defaults to empty

---

## 🔐 Access Control

- **Protected Route**: Tech role required
- **Service Role**: Uses Supabase service key for admin operations
- **No Client Access**: Import page hidden from consumers

---

## 📝 JSON File Format

The `perplexityresults.json` should contain an array of lash maps:

```json
[
  {
    "name": "Classic Cat Eye",
    "category": "Classic",
    "difficulty": "Beginner",
    "description": "Features lashes that gradually increase...",
    "zones": [
      {"zone": "Inner", "length": "8mm", "curl": "C", "diameter": "0.15mm"},
      {"zone": "Center", "length": "10mm", "curl": "C", "diameter": "0.15mm"}
    ],
    "products": [
      "0.15mm Classic Lashes - C Curl",
      "Adhesive suitable for classic applications"
    ],
    "application_notes": "Maintain a smooth graduation..."
  }
]
```

---

## 🎯 Use Cases

### 1. **Initial Setup**
- Import all 40+ lash maps at once
- Populate your lash map library
- Get started quickly

### 2. **Data Updates**
- Update descriptions
- Add new zones
- Refresh product lists
- Update application notes

### 3. **Development**
- Test with different data sets
- Reset database to known state
- Sync between environments

### 4. **Content Management**
- Bulk update categories
- Standardize difficulty levels
- Normalize product names

---

## 🚨 Important Notes

### Category Normalization
- "Classic" in JSON → "Natural" in database
- Required to match database enum
- Automatic conversion

### Duplicate Detection
- Uses exact name matching (case-sensitive)
- Checks existing maps before insert/update
- No fuzzy matching

### Data Preservation
- Update mode overwrites ALL fields
- Original created_at preserved
- Images/URLs not affected if not in JSON

---

## 🎉 Quick Start

### First Time Import

1. **Open Import Page**
   ```
   http://localhost:3000/dashboard/tech/lash-maps/import
   ```

2. **Select "Update Existing"**

3. **Click "Preview Maps"**
   - Should see 40+ maps

4. **Click "Import Maps"**
   - Confirm the action
   - Watch it process

5. **Success!**
   - Should show 40+ created
   - 0 errors
   - Click "View All Lash Maps"

### Subsequent Imports

Use "Skip Duplicates" mode to add only new maps without touching existing customizations.

---

## 🐛 Troubleshooting

### "No maps in preview"
- Check perplexityresults.json exists in `src/app/`
- Verify JSON is valid
- Check file permissions

### "All maps skipped"
- Maps already exist in database
- Use "Update Existing" mode to refresh them
- Or use "Create New Only" for strict mode

### "Import errors"
- Check detailed error log
- Verify database connection
- Check Supabase service role key in .env.local

### CLI script won't run
- Run `npm install` first
- Check .env.local has Supabase credentials
- Verify Node.js version (14+)

---

## 📦 Files Created

```
src/app/dashboard/tech/lash-maps/import/
  └── page.tsx                    # Import UI page

src/app/api/lash-maps/import/
  ├── route.ts                    # Import API endpoint
  └── preview/
      └── route.ts                # Preview API endpoint

import-lash-maps.js               # CLI script

package.json                      # Added npm script
```

---

## ✅ Testing Checklist

- [ ] Navigate to import page
- [ ] Preview loads all maps
- [ ] Import creates new maps
- [ ] Import updates existing maps
- [ ] Import skips duplicates (skip mode)
- [ ] Error handling shows details
- [ ] CLI script works
- [ ] Results display correctly
- [ ] Import button in admin page works

---

## 🎊 You're All Set!

Your lash map import system is ready! You can now:
- ✅ Import 40+ professional lash maps
- ✅ Update maps in bulk
- ✅ Use CLI for quick imports
- ✅ Manage your lash map library efficiently

**Try it now:** Go to `/dashboard/tech/lash-maps/import` 🚀

